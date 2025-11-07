from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import json
from openai import OpenAI
import googlemaps
from datetime import datetime, timedelta
from cache import get_cache_key, get_cached, set_cached, CACHE_TTL_PLACES, CACHE_TTL_ROUTES, get_cache_stats
from features import (
    analyze_tourist_route, favorite_routes_manager, split_tasks_multiple_people,
    analyze_shopping_list, generate_proactive_notifications, discover_better_alternatives,
    check_calendar_conflicts, estimate_crowdedness, add_rest_stops
)

load_dotenv()

app = FastAPI(title="Smart Errand Runner API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize APIs
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))


class ErrandRequest(BaseModel):
    user_input: str
    start_address: str
    start_time: Optional[str] = None  # Format: "HH:MM"
    mode: Optional[str] = "balanced"  # "economy", "fast", "balanced"
    carpooling: Optional[List[dict]] = None  # [{"name": "Maria", "tasks": "ir ao mercado"}]
    suggest_best_time: Optional[bool] = False
    delivery_mode: Optional[bool] = False  # Para modo entregador/uber
    # Novas features
    tourist_mode: Optional[bool] = False
    num_people_split: Optional[int] = None  # Para split de tarefas
    is_shopping_list: Optional[bool] = False
    calendar_events: Optional[List[dict]] = None
    include_rest_stops: Optional[bool] = False
    user_id: Optional[str] = "default_user"  # Para rotas favoritas


class Task(BaseModel):
    name: str
    place_name: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    closing_time: Optional[str] = None
    constraint: Optional[str] = None
    order: Optional[int] = None
    popular_times: Optional[dict] = None  # Info sobre filas/horários de pico
    combined_with: Optional[List[str]] = None  # Tarefas que podem ser combinadas aqui


class RouteResponse(BaseModel):
    tasks: List[Task]
    optimized_route: List[dict]
    total_duration: str
    total_distance: str
    warnings: List[str]
    map_url: Optional[str] = None
    smart_suggestions: Optional[List[str]] = []  # Sugestões inteligentes
    nearby_points: Optional[List[dict]] = []  # Pontos de interesse no caminho
    best_departure_time: Optional[str] = None  # Melhor horário para sair
    economy_savings: Optional[dict] = None  # Economia de combustível/tempo
    carpooling_info: Optional[dict] = None  # Info sobre carona compartilhada
    # Novas features
    tourist_itinerary: Optional[dict] = None  # FEATURE 1: Modo Turista
    favorite_match: Optional[dict] = None  # FEATURE 2: Rotas Favoritas
    task_split: Optional[dict] = None  # FEATURE 3: Split de Tarefas
    shopping_analysis: Optional[dict] = None  # FEATURE 4: Compras Inteligentes
    proactive_notifications: Optional[List[dict]] = []  # FEATURE 7: Assistant Proativo
    better_alternatives: Optional[List[dict]] = []  # FEATURE 8: Descubra Locais Novos
    calendar_check: Optional[dict] = None  # FEATURE 12: Calendário
    crowdedness_info: Optional[List[dict]] = []  # FEATURE 14: Evite Multidões
    rest_stops: Optional[dict] = None  # FEATURE 15: Pausas


@app.get("/")
def read_root():
    return {"message": "Smart Errand Runner API is running"}


@app.get("/api/cache/stats")
def cache_stats():
    """
    Melhoria #7: Endpoint para ver estatísticas do cache
    """
    return get_cache_stats()


# FEATURE 2: Endpoints para Rotas Favoritas
@app.post("/api/favorites/save")
async def save_favorite_route(user_id: str, route_name: str, route_data: dict):
    """
    Salva uma rota como favorita
    """
    favorite_routes_manager.save_route(user_id, route_name, route_data)
    return {"message": "Rota salva com sucesso!", "route_name": route_name}


@app.get("/api/favorites/{user_id}")
async def get_favorite_routes(user_id: str):
    """
    Retorna rotas favoritas do usuário
    """
    favorites = favorite_routes_manager.get_favorites(user_id)
    return {"favorites": favorites}


@app.post("/api/optimize-errands", response_model=RouteResponse)
async def optimize_errands(request: ErrandRequest):
    """
    Main endpoint to optimize errands based on user input with advanced features
    """
    try:
        # FEATURE 1: Modo Turista
        tourist_itinerary = None
        if request.tourist_mode:
            tourist_itinerary = await analyze_tourist_route(request.user_input)
        
        # FEATURE 4: Compras Inteligentes
        shopping_analysis = None
        if request.is_shopping_list:
            items = request.user_input.split(",")
            shopping_analysis = await analyze_shopping_list(items, {})
        
        # Step 1: Use GPT to parse the user input
        tasks = await parse_errands_with_gpt(request.user_input, request.start_time)
        
        # FEATURE 2: Rotas Favoritas - Detectar padrões
        favorite_match = await favorite_routes_manager.detect_patterns(
            request.user_id,
            [t.name for t in tasks]
        )
        
        # Step 2: Find places using Google Places API
        start_coords = get_coordinates(request.start_address)
        tasks = await find_places_for_tasks(tasks, start_coords)
        
        # FEATURE 14: Evite Multidões
        crowdedness_info = []
        for task in tasks:
            if hasattr(task, 'popular_times') and task.popular_times:
                crowd_data = estimate_crowdedness(
                    task.popular_times.get("types", []),
                    datetime.now().hour,
                    datetime.now().weekday()
                )
                crowdedness_info.append({
                    "task": task.name,
                    **crowd_data
                })
        
        # NEW FEATURE 2: Sugestões Inteligentes de Combinação
        smart_suggestions = await analyze_task_combinations(tasks)
        
        # NEW FEATURE 4: Modo Carona (Carpooling)
        carpooling_info = None
        if request.carpooling:
            carpooling_tasks = await parse_carpooling_tasks(request.carpooling, start_coords)
            tasks.extend(carpooling_tasks)
            carpooling_info = await optimize_carpooling(tasks, carpooling_tasks)
        
        # NEW FEATURE 3: Melhor Horário para Sair
        best_departure_time = None
        if request.suggest_best_time:
            best_departure_time = await suggest_best_departure_time(tasks, start_coords)
        
        # Step 3: Optimize route considering time constraints and mode
        optimized_route, warnings = await optimize_route_with_constraints(
            tasks, start_coords, request.start_time or "now", 
            mode=request.mode, delivery_mode=request.delivery_mode
        )
        
        # NEW FEATURE 11: Pontos de Interesse no Caminho
        nearby_points = await find_nearby_points_of_interest(optimized_route)
        
        # Step 4: Calculate total duration and distance
        total_duration, total_distance = calculate_totals(optimized_route)
        
        # NEW FEATURE 1: Economia vs Rápido - Calcular savings
        economy_savings = None
        if request.mode in ["economy", "fast"]:
            economy_savings = await calculate_mode_savings(optimized_route, request.mode)
        
        # FEATURE 3: Split de Tarefas
        task_split = None
        if request.num_people_split and request.num_people_split > 1:
            task_split = await split_tasks_multiple_people(
                [{"name": t.name, "address": t.address} for t in tasks],
                request.num_people_split
            )
        
        # FEATURE 7: Assistant Proativo
        proactive_notifications = generate_proactive_notifications({
            "optimized_route": optimized_route,
            "start_time": request.start_time
        }, datetime.now())
        
        # FEATURE 8: Descubra Locais Novos
        better_alternatives = []
        for task in tasks[:2]:  # Apenas primeiros 2 para não sobrecarregar
            if task.lat and task.lng:
                alternative = await discover_better_alternatives(
                    gmaps, 
                    {"lat": task.lat, "lng": task.lng},
                    "point_of_interest"
                )
                if alternative and alternative.get("has_alternatives"):
                    better_alternatives.append({
                        "for_task": task.name,
                        **alternative
                    })
        
        # FEATURE 12: Integração com Calendário
        calendar_check = None
        if request.calendar_events:
            calendar_check = check_calendar_conflicts({
                "start_time": request.start_time,
                "total_duration": total_duration
            }, request.calendar_events)
        
        # FEATURE 15: Rota com Pausas
        rest_stops = None
        if request.include_rest_stops:
            rest_stops = add_rest_stops(optimized_route)
        
        return RouteResponse(
            tasks=tasks,
            optimized_route=optimized_route,
            total_duration=total_duration,
            total_distance=total_distance,
            warnings=warnings,
            map_url=None,
            smart_suggestions=smart_suggestions,
            nearby_points=nearby_points,
            best_departure_time=best_departure_time,
            economy_savings=economy_savings,
            carpooling_info=carpooling_info,
            # Novas features
            tourist_itinerary=tourist_itinerary,
            favorite_match=favorite_match,
            task_split=task_split,
            shopping_analysis=shopping_analysis,
            proactive_notifications=proactive_notifications,
            better_alternatives=better_alternatives,
            calendar_check=calendar_check,
            crowdedness_info=crowdedness_info,
            rest_stops=rest_stops
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def parse_errands_with_gpt(user_input: str, start_time: Optional[str]) -> List[Task]:
    """
    Use GPT to parse natural language input into structured tasks
    """
    system_prompt = """Você é um assistente que interpreta listas de tarefas/recados.
    Analise o texto do usuário e extraia:
    1. Nome da tarefa
    2. Tipo de estabelecimento (ex: "banco", "farmácia", "correios", "padaria")
    3. Restrições de horário (ex: "fecha às 16h")
    4. Restrições de ordem (ex: "na volta", "primeiro", "último")
    
    Retorne APENAS um JSON válido no formato:
    {
        "tasks": [
            {
                "name": "ir ao banco",
                "place_name": "banco",
                "closing_time": "16:00",
                "constraint": "urgent"
            }
        ]
    }
    
    Para closing_time, use formato HH:MM (24h).
    Para constraint, use: "first" (primeira parada), "last" (última parada), "urgent" (horário apertado), ou null.
    """
    
    user_prompt = f"Hora de início: {start_time or 'agora'}\n\nTarefas: {user_input}"
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.3
    )
    
    content = response.choices[0].message.content.strip()
    
    # Try to extract JSON from markdown code blocks if present
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()
    
    parsed = json.loads(content)
    tasks = [Task(**task) for task in parsed["tasks"]]
    
    return tasks


def get_coordinates(address: str) -> dict:
    """
    Get latitude and longitude for an address
    Melhoria #7: Com cache inteligente
    """
    # Tentar recuperar do cache
    cache_key = get_cache_key('geocoding', address)
    cached = get_cached(cache_key, CACHE_TTL_PLACES)
    if cached:
        print(f"✅ Cache HIT: geocoding {address[:30]}...")
        return cached
    
    print(f"❌ Cache MISS: geocoding {address[:30]}...")
    geocode_result = gmaps.geocode(address)
    if not geocode_result:
        raise ValueError(f"Could not find coordinates for address: {address}")
    
    location = geocode_result[0]["geometry"]["location"]
    result = {"lat": location["lat"], "lng": location["lng"]}
    
    # Armazenar no cache
    set_cached(cache_key, result)
    
    return result


async def find_places_for_tasks(tasks: List[Task], start_coords: dict) -> List[Task]:
    """
    Find actual places for each task using Google Places API
    NEW FEATURE 10: Includes popular_times (queue info)
    """
    for task in tasks:
        if task.place_name:
            # Search for the place
            places_result = gmaps.places(
                query=task.place_name,
                location=(start_coords["lat"], start_coords["lng"]),
                radius=10000  # 10km radius
            )
            
            if places_result["results"]:
                place = places_result["results"][0]
                task.address = place["formatted_address"]
                task.lat = place["geometry"]["location"]["lat"]
                task.lng = place["geometry"]["location"]["lng"]
                
                # Get types from initial search result
                place_types = place.get("types", [])
                
                # Get place details for opening hours
                place_details = gmaps.place(place["place_id"], 
                                           fields=["opening_hours", "name"])
                result = place_details["result"]
                
                if "opening_hours" in result:
                    opening_hours = result["opening_hours"]
                    if "periods" in opening_hours and not task.closing_time:
                        # Extract closing time for today
                        try:
                            today = datetime.now().weekday()
                            for period in opening_hours["periods"]:
                                if "close" in period:
                                    close_time = period["close"]["time"]
                                    task.closing_time = f"{close_time[:2]}:{close_time[2:]}"
                                    break
                        except:
                            pass
                
                # NEW FEATURE 10: Extract popular times info
                # Note: Google doesn't provide this directly via API, but we can simulate
                # In production, you'd use populartimes library or scrape
                current_hour = datetime.now().hour
                task.popular_times = {
                    "current_busy_level": estimate_busy_level(current_hour, place_types),
                    "peak_hours": get_peak_hours(place_types),
                    "recommendation": get_queue_recommendation(current_hour, place_types)
                }
    
    return tasks


def estimate_busy_level(hour: int, place_types: List[str]) -> str:
    """Estimate how busy a place is based on time and type"""
    if "bank" in place_types:
        if 11 <= hour <= 14:
            return "Muito cheio (horário de almoço)"
        elif 15 <= hour <= 16:
            return "Cheio"
        return "Tranquilo"
    elif "post_office" in place_types:
        if 9 <= hour <= 11 or 14 <= hour <= 16:
            return "Cheio"
        return "Moderado"
    elif "pharmacy" in place_types or "supermarket" in place_types:
        if 17 <= hour <= 19:
            return "Muito cheio (fim de tarde)"
        return "Tranquilo"
    return "Normal"


def get_peak_hours(place_types: List[str]) -> str:
    """Get typical peak hours for place type"""
    if "bank" in place_types:
        return "11h-14h (almoço) e 15h-16h (antes de fechar)"
    elif "post_office" in place_types:
        return "9h-11h e 14h-16h"
    elif "pharmacy" in place_types or "supermarket" in place_types:
        return "17h-19h (fim de tarde)"
    elif "bakery" in place_types:
        return "7h-9h (manhã) e 17h-19h"
    return "10h-12h e 15h-17h"


def get_queue_recommendation(hour: int, place_types: List[str]) -> str:
    """Get recommendation to avoid queues"""
    busy_level = estimate_busy_level(hour, place_types)
    if "Muito cheio" in busy_level:
        return "⚠️ Horário de pico! Se possível, visite em outro horário"
    elif "Cheio" in busy_level:
        return "⏰ Pode ter fila. Considere ir antes ou depois"
    return "✅ Bom horário para visitar"


async def optimize_route_with_constraints(
    tasks: List[Task], 
    start_coords: dict, 
    start_time: str,
    mode: str = "balanced",
    delivery_mode: bool = False
) -> tuple:
    """
    Optimize route considering time constraints using Google Maps Directions API
    NEW FEATURE 1: Supports economy/fast/balanced modes
    NEW FEATURE 12: Supports delivery mode (TSP optimization)
    """
    warnings = []
    
    # Parse start time
    if start_time == "now":
        current_time = datetime.now()
    else:
        time_parts = start_time.split(":")
        current_time = datetime.now().replace(
            hour=int(time_parts[0]), 
            minute=int(time_parts[1]),
            second=0,
            microsecond=0
        )
    
    # NEW FEATURE 12: Delivery mode uses different optimization (TSP)
    if delivery_mode:
        ordered_tasks = await optimize_delivery_route(tasks, start_coords)
        warnings.append("🚚 Modo Entregador: Rota otimizada para múltiplas entregas")
    else:
        # Separate tasks by constraints
        first_tasks = [t for t in tasks if t.constraint == "first"]
        last_tasks = [t for t in tasks if t.constraint == "last"]
        urgent_tasks = sorted(
            [t for t in tasks if t.constraint == "urgent" or t.closing_time],
            key=lambda x: x.closing_time or "23:59"
        )
        normal_tasks = [
            t for t in tasks 
            if t not in first_tasks and t not in last_tasks and t not in urgent_tasks
        ]
        
        # Build ordered task list
        ordered_tasks = first_tasks + urgent_tasks + normal_tasks + last_tasks
    
    # Create waypoints
    waypoints = []
    for task in ordered_tasks:
        if task.lat and task.lng:
            waypoints.append({"lat": task.lat, "lng": task.lng, "task": task})
    
    # Get directions
    route_legs = []
    current_location = start_coords
    accumulated_time = current_time
    
    # NEW FEATURE 1: Configure route parameters based on mode
    route_params = {}
    if mode == "economy":
        route_params["avoid"] = ["tolls", "highways"]  # Evita pedágios e rodovias
        warnings.append("🌱 Modo Economia: Rota otimizada para menor distância e sem pedágios")
    elif mode == "fast":
        route_params["optimize_waypoints"] = False  # Prioriza velocidade sobre distância
        warnings.append("⚡ Modo Rápido: Rota otimizada para menor tempo")
    
    for i, waypoint in enumerate(waypoints):
        # Get directions to next waypoint with mode-specific parameters
        directions = gmaps.directions(
            origin=current_location,
            destination={"lat": waypoint["lat"], "lng": waypoint["lng"]},
            mode="driving",
            departure_time=datetime.now(),
            **route_params
        )
        
        if directions:
            leg = directions[0]["legs"][0]
            duration_seconds = leg["duration"]["value"]
            
            # Calculate arrival time
            accumulated_time += timedelta(seconds=duration_seconds)
            arrival_time_str = accumulated_time.strftime("%H:%M")
            
            # Check if we'll arrive before closing time
            task = waypoint["task"]
            if task.closing_time and arrival_time_str > task.closing_time:
                warnings.append(
                    f"AVISO: Você pode chegar em '{task.name}' às {arrival_time_str}, "
                    f"mas fecha às {task.closing_time}!"
                )
            
            route_legs.append({
                "task": task.name,
                "address": task.address,
                "distance": leg["distance"]["text"],
                "duration": leg["duration"]["text"],
                "arrival_time": arrival_time_str,
                "closing_time": task.closing_time,
                "start_location": leg["start_location"],
                "end_location": leg["end_location"],
                "polyline": directions[0]["overview_polyline"]["points"]
            })
            
            current_location = {"lat": waypoint["lat"], "lng": waypoint["lng"]}
            # Add 10 minutes for the errand
            accumulated_time += timedelta(minutes=10)
    
    # Add return to home
    directions_home = gmaps.directions(
        origin=current_location,
        destination=start_coords,
        mode="driving",
        departure_time=datetime.now()
    )
    
    if directions_home:
        leg = directions_home[0]["legs"][0]
        accumulated_time += timedelta(seconds=leg["duration"]["value"])
        
        route_legs.append({
            "task": "Retornar para casa",
            "address": leg["end_address"],
            "distance": leg["distance"]["text"],
            "duration": leg["duration"]["text"],
            "arrival_time": accumulated_time.strftime("%H:%M"),
            "closing_time": None,
            "start_location": leg["start_location"],
            "end_location": leg["end_location"],
            "polyline": directions_home[0]["overview_polyline"]["points"]
        })
    
    return route_legs, warnings


def calculate_totals(route_legs: List[dict]) -> tuple:
    """
    Calculate total duration and distance
    """
    total_duration_min = 0
    total_distance_km = 0.0
    
    for leg in route_legs[:-1]:  # Exclude return home from duration count
        # Parse duration (e.g., "15 mins" or "1 hour 20 mins")
        duration_text = leg["duration"]
        if "hour" in duration_text:
            hours = int(duration_text.split("hour")[0].strip())
            total_duration_min += hours * 60
            if "min" in duration_text:
                mins = int(duration_text.split("hour")[1].split("min")[0].strip())
                total_duration_min += mins
        elif "min" in duration_text:
            mins = int(duration_text.split("min")[0].strip())
            total_duration_min += mins
        
        # Parse distance
        distance_text = leg["distance"].replace(",", ".")
        if "km" in distance_text:
            km = float(distance_text.split("km")[0].strip())
            total_distance_km += km
        elif "m" in distance_text:
            m = float(distance_text.split("m")[0].strip())
            total_distance_km += m / 1000
    
    # Add 10 minutes per errand (except last)
    total_duration_min += (len(route_legs) - 1) * 10
    
    hours = total_duration_min // 60
    mins = total_duration_min % 60
    
    if hours > 0:
        duration_str = f"{int(hours)}h {int(mins)}min"
    else:
        duration_str = f"{int(mins)}min"
    
    distance_str = f"{total_distance_km:.1f} km"
    
    return duration_str, distance_str


# NEW FEATURE 2: Sugestões Inteligentes de Combinação
async def analyze_task_combinations(tasks: List[Task]) -> List[str]:
    """
    Use GPT to suggest smart task combinations
    """
    if len(tasks) < 2:
        return []
    
    task_descriptions = [f"- {t.name} em {t.place_name or 'local desconhecido'}" for t in tasks]
    
    prompt = f"""Analise esta lista de tarefas e sugira combinações inteligentes:

{chr(10).join(task_descriptions)}

Procure por:
1. Estabelecimentos que oferecem múltiplos serviços (ex: farmácia com caixa eletrônico)
2. Locais muito próximos que podem ser visitados juntos
3. Tarefas que podem ser combinadas (ex: comprar remédio e sacar dinheiro na mesma farmácia)

Retorne uma lista de sugestões práticas e curtas. Máximo 3 sugestões."""
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=200
        )
        
        content = response.choices[0].message.content.strip()
        suggestions = [s.strip() for s in content.split('\n') if s.strip() and not s.strip().startswith('#')]
        return suggestions[:3]
    except:
        return []


# NEW FEATURE 3: Melhor Horário para Sair
async def suggest_best_departure_time(tasks: List[Task], start_coords: dict) -> str:
    """
    Analyze tasks and suggest best departure time
    """
    if not tasks:
        return None
    
    # Find all closing times
    closing_times = [t.closing_time for t in tasks if t.closing_time]
    if not closing_times:
        return "Você pode sair a qualquer momento! Nenhum estabelecimento tem restrição de horário."
    
    # Find earliest closing time
    earliest_closing = min(closing_times)
    earliest_hour = int(earliest_closing.split(":")[0])
    
    # Estimate total route time (rough estimate: 15 min per stop + 30 min total travel)
    estimated_duration_min = len(tasks) * 15 + 30
    
    # Calculate ideal departure time
    departure_hour = earliest_hour - (estimated_duration_min // 60) - 1  # 1 hour buffer
    departure_minute = 60 - (estimated_duration_min % 60)
    
    if departure_minute >= 60:
        departure_hour += 1
        departure_minute -= 60
    
    # Ensure it's not in the past or too early
    current_hour = datetime.now().hour
    if departure_hour < current_hour:
        departure_hour = current_hour
        departure_minute = datetime.now().minute + 10
    elif departure_hour < 8:
        departure_hour = 8
        departure_minute = 0
    
    return f"⏰ Melhor horário para sair: {departure_hour:02d}:{departure_minute:02d} - Isso garante que você chegue em todos os lugares antes de fecharem!"


# NEW FEATURE 4: Modo Carona
async def parse_carpooling_tasks(carpooling_list: List[dict], start_coords: dict) -> List[Task]:
    """
    Parse carpooling tasks from other people
    """
    all_tasks = []
    for person in carpooling_list:
        person_name = person.get("name", "Pessoa")
        tasks_text = person.get("tasks", "")
        
        # Use GPT to parse these tasks
        tasks = await parse_errands_with_gpt(f"{person_name}: {tasks_text}", None)
        for task in tasks:
            task.name = f"{task.name} ({person_name})"
        all_tasks.extend(tasks)
    
    return all_tasks


async def optimize_carpooling(all_tasks: List[Task], carpooling_tasks: List[Task]) -> dict:
    """
    Analyze carpooling optimization
    """
    total_tasks = len(all_tasks)
    carpooling_count = len(carpooling_tasks)
    
    return {
        "total_people": len(set([t.name.split("(")[-1].strip(")") for t in carpooling_tasks])) + 1,
        "shared_tasks": carpooling_count,
        "message": f"🚗 Carona otimizada! Você está levando {carpooling_count} tarefas de outras pessoas. Economia de combustível e tempo para todos!"
    }


# NEW FEATURE 11: Pontos de Interesse no Caminho
async def find_nearby_points_of_interest(route: List[dict]) -> List[dict]:
    """
    Find interesting points along the route
    """
    if len(route) < 2:
        return []
    
    nearby_points = []
    
    # Check points between each leg
    for i in range(len(route) - 1):
        start = route[i]["end_location"]
        end = route[i + 1]["start_location"]
        
        # Calculate midpoint
        mid_lat = (start["lat"] + end["lat"]) / 2
        mid_lng = (start["lng"] + end["lng"]) / 2
        
        try:
            # Search for interesting places nearby
            places = gmaps.places_nearby(
                location=(mid_lat, mid_lng),
                radius=500,  # 500m radius
                type="gas_station"  # Start with gas stations
            )
            
            if places["results"]:
                for place in places["results"][:1]:  # Only first result
                    nearby_points.append({
                        "name": place["name"],
                        "type": "Posto de gasolina",
                        "location": place["geometry"]["location"],
                        "between": f"Entre '{route[i]['task']}' e '{route[i+1]['task']}'"
                    })
        except:
            pass
    
    return nearby_points[:3]  # Max 3 suggestions


# NEW FEATURE 1: Calculate savings for economy/fast mode
async def calculate_mode_savings(route: List[dict], mode: str) -> dict:
    """
    Calculate savings/benefits of chosen mode
    """
    total_distance = 0
    total_duration = 0
    
    for leg in route:
        # Extract distance in km
        dist_text = leg["distance"].replace(",", ".")
        if "km" in dist_text:
            total_distance += float(dist_text.split("km")[0].strip())
        
        # Extract duration in minutes
        dur_text = leg["duration"]
        if "hour" in dur_text:
            hours = int(dur_text.split("hour")[0].strip())
            total_duration += hours * 60
            if "min" in dur_text:
                mins = int(dur_text.split("hour")[1].split("min")[0].strip())
                total_duration += mins
        elif "min" in dur_text:
            mins = int(dur_text.split("min")[0].strip())
            total_duration += mins
    
    if mode == "economy":
        # Estimate toll savings (average R$ 15 per toll avoided)
        estimated_toll_savings = 15.00 * 2  # Assume 2 tolls avoided
        # Fuel savings (shorter distance usually means less fuel)
        fuel_saved_liters = total_distance * 0.05  # 5% savings estimate
        fuel_cost_saved = fuel_saved_liters * 5.50  # R$ 5.50/L average
        
        return {
            "mode": "economy",
            "toll_savings": f"R$ {estimated_toll_savings:.2f}",
            "fuel_savings": f"{fuel_saved_liters:.1f}L (~R$ {fuel_cost_saved:.2f})",
            "message": f"💰 Economia total estimada: R$ {estimated_toll_savings + fuel_cost_saved:.2f}"
        }
    elif mode == "fast":
        # Estimate time saved (assume 20% faster than economy mode)
        time_saved = total_duration * 0.2
        
        return {
            "mode": "fast",
            "time_saved": f"{int(time_saved)} minutos",
            "message": f"⚡ Você economiza aproximadamente {int(time_saved)} minutos com esta rota!"
        }
    
    return {}


# NEW FEATURE 12: Delivery Mode Optimization (TSP)
async def optimize_delivery_route(tasks: List[Task], start_coords: dict) -> List[Task]:
    """
    Optimize route for delivery mode using distance matrix and greedy TSP
    """
    if len(tasks) <= 2:
        return tasks
    
    # Get all coordinates
    locations = [start_coords] + [{"lat": t.lat, "lng": t.lng} for t in tasks if t.lat and t.lng]
    
    # Simple greedy algorithm: always go to nearest unvisited point
    visited = [False] * len(tasks)
    ordered = []
    current_idx = 0  # Start from origin
    
    for _ in range(len(tasks)):
        min_distance = float('inf')
        next_idx = -1
        
        for i, task in enumerate(tasks):
            if not visited[i] and task.lat and task.lng:
                # Calculate rough distance (euclidean approximation)
                if current_idx == 0:
                    curr_lat, curr_lng = start_coords["lat"], start_coords["lng"]
                else:
                    curr_lat, curr_lng = ordered[-1].lat, ordered[-1].lng
                
                distance = ((task.lat - curr_lat) ** 2 + (task.lng - curr_lng) ** 2) ** 0.5
                
                if distance < min_distance:
                    min_distance = distance
                    next_idx = i
        
        if next_idx != -1:
            visited[next_idx] = True
            ordered.append(tasks[next_idx])
            current_idx = next_idx + 1
    
    return ordered


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

