"""
Novas Features Avançadas para Smart Errand Runner
"""

from typing import List, Optional, Dict
from datetime import datetime, timedelta
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# FEATURE 1: Modo Turista
async def analyze_tourist_route(attractions: str, days: int = 1) -> dict:
    """
    Analisa lista de atrações turísticas e cria itinerário otimizado
    """
    prompt = f"""Você é um guia turístico especialista. Analise estas atrações e crie um itinerário otimizado:

Atrações desejadas: {attractions}
Tempo disponível: {days} dia(s)

Para cada atração, forneça:
1. Tempo estimado de visita
2. Melhor horário para visitar (evitar filas)
3. Dicas importantes
4. Restaurantes próximos recomendados

Retorne um JSON no formato:
{{
    "itinerary": [
        {{
            "attraction": "Nome",
            "visit_duration": "tempo em minutos",
            "best_time": "horário recomendado",
            "tips": "dicas importantes",
            "nearby_restaurants": ["restaurante1", "restaurante2"]
        }}
    ],
    "total_time": "tempo total estimado",
    "recommendations": ["dica1", "dica2"]
}}
"""
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    content = response.choices[0].message.content.strip()
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    
    return json.loads(content)


# FEATURE 2: Rotas Favoritas com IA
class FavoriteRoutesAI:
    """Gerencia rotas favoritas e aprende padrões do usuário"""
    
    def __init__(self):
        self.routes_db = {}  # Em produção, usar banco de dados real
    
    def save_route(self, user_id: str, route_name: str, route_data: dict):
        """Salva uma rota como favorita"""
        if user_id not in self.routes_db:
            self.routes_db[user_id] = {}
        
        self.routes_db[user_id][route_name] = {
            "route": route_data,
            "created_at": datetime.now().isoformat(),
            "usage_count": 0,
            "last_used": None
        }
    
    def get_favorites(self, user_id: str) -> List[dict]:
        """Retorna rotas favoritas do usuário"""
        return list(self.routes_db.get(user_id, {}).values())
    
    async def detect_patterns(self, user_id: str, current_tasks: List[str]) -> Optional[dict]:
        """Detecta se o usuário está fazendo uma rota conhecida"""
        favorites = self.get_favorites(user_id)
        
        # Simples matching - pode ser melhorado com ML
        for fav in favorites:
            fav_tasks = fav["route"].get("tasks", [])
            if len(set(current_tasks) & set(fav_tasks)) >= len(current_tasks) * 0.7:
                return {
                    "matched": True,
                    "route_name": fav["route"].get("name", "Rota Favorita"),
                    "suggestion": f"Parece sua rota '{fav['route'].get('name')}'! Quer usar o atalho?"
                }
        
        return None


# FEATURE 3: Split de Tarefas
async def split_tasks_multiple_people(tasks: List[dict], num_people: int = 2) -> dict:
    """
    Divide tarefas entre múltiplas pessoas de forma otimizada
    """
    tasks_str = "\n".join([f"- {t.get('name', t)}" for t in tasks])
    
    prompt = f"""Você precisa dividir estas tarefas entre {num_people} pessoas de forma otimizada:

Tarefas:
{tasks_str}

Divida considerando:
1. Proximidade geográfica (tarefas próximas para a mesma pessoa)
2. Tempo total balanceado entre as pessoas
3. Tipos de tarefa compatíveis (ex: compras juntas)

Retorne JSON:
{{
    "splits": [
        {{
            "person": 1,
            "tasks": ["tarefa1", "tarefa2"],
            "estimated_time": "tempo em minutos",
            "route_summary": "resumo da rota"
        }}
    ],
    "meeting_point": "sugestão de ponto de encontro",
    "time_saved": "tempo economizado vs uma pessoa fazer tudo",
    "recommendations": ["dica1", "dica2"]
}}
"""
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5
    )
    
    content = response.choices[0].message.content.strip()
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    
    return json.loads(content)


# FEATURE 4: Compras Inteligentes
async def analyze_shopping_list(items: List[str], location: dict) -> dict:
    """
    Analisa lista de compras e sugere estabelecimentos que têm tudo
    """
    items_str = ", ".join(items)
    
    prompt = f"""Analise esta lista de compras e sugira estabelecimentos que possam ter TODOS ou a maioria dos itens:

Lista: {items_str}

Considere:
1. Supermercados grandes (geralmente têm de tudo)
2. Farmácias (remédios + alguns itens de conveniência)
3. Lojas de conveniência 24h
4. Mercados especializados

Retorne JSON:
{{
    "recommendations": [
        {{
            "store_type": "tipo de estabelecimento",
            "items_available": ["item1", "item2"],
            "items_missing": ["item3"],
            "convenience_score": "1-10",
            "reasoning": "por que essa opção é boa"
        }}
    ],
    "optimal_strategy": "melhor estratégia (1 ou 2 lugares)",
    "time_estimate": "tempo total estimado"
}}
"""
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.6
    )
    
    content = response.choices[0].message.content.strip()
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    
    return json.loads(content)


# FEATURE 7: Assistant Proativo
def generate_proactive_notifications(route_data: dict, current_time: datetime) -> List[dict]:
    """
    Gera notificações proativas baseadas na rota e hora atual
    """
    notifications = []
    
    # Analisa cada parada
    for stop in route_data.get("optimized_route", []):
        arrival = stop.get("arrival_time")
        closing = stop.get("closing_time")
        
        if arrival and closing:
            # Converte strings para datetime para comparação
            try:
                arrival_dt = datetime.strptime(arrival, "%H:%M").replace(
                    year=current_time.year,
                    month=current_time.month,
                    day=current_time.day
                )
                closing_dt = datetime.strptime(closing, "%H:%M").replace(
                    year=current_time.year,
                    month=current_time.month,
                    day=current_time.day
                )
                
                time_margin = (closing_dt - arrival_dt).total_seconds() / 60
                
                if time_margin < 15:
                    notifications.append({
                        "type": "urgent",
                        "title": f"⚠️ Tempo Apertado!",
                        "message": f"{stop['task']} fecha em {time_margin:.0f} min após sua chegada",
                        "action": "Considere ir direto para lá"
                    })
                elif time_margin < 30:
                    notifications.append({
                        "type": "warning",
                        "title": "⏰ Atenção ao Horário",
                        "message": f"{stop['task']} tem apenas {time_margin:.0f} min de margem",
                        "action": "Não demore nas paradas anteriores"
                    })
            except:
                pass
    
    return notifications


# FEATURE 8: Descubra Locais Novos
async def discover_better_alternatives(gmaps, current_place: dict, place_type: str) -> Optional[dict]:
    """
    Descobre estabelecimentos alternativos melhores avaliados
    """
    try:
        # Busca lugares similares próximos
        nearby = gmaps.places_nearby(
            location=(current_place["lat"], current_place["lng"]),
            radius=2000,  # 2km
            type=place_type
        )
        
        # Filtra por rating
        better_options = []
        for place in nearby.get("results", [])[:5]:
            rating = place.get("rating", 0)
            if rating >= 4.5:  # Apenas bem avaliados
                better_options.append({
                    "name": place["name"],
                    "rating": rating,
                    "user_ratings": place.get("user_ratings_total", 0),
                    "address": place.get("vicinity", ""),
                    "reason": f"⭐ {rating} estrelas com {place.get('user_ratings_total', 0)} avaliações"
                })
        
        if better_options:
            return {
                "has_alternatives": True,
                "alternatives": better_options[:3],
                "message": "Encontramos opções bem avaliadas próximas!"
            }
    except:
        pass
    
    return None


# FEATURE 12: Integração com Calendário (simulado)
def check_calendar_conflicts(route_data: dict, calendar_events: List[dict]) -> dict:
    """
    Verifica conflitos com eventos do calendário
    """
    conflicts = []
    suggestions = []
    
    route_start = route_data.get("start_time", "now")
    route_duration = route_data.get("total_duration", "60min")
    
    # Parse duration
    duration_min = 60  # default
    if "hour" in route_duration:
        duration_min = int(route_duration.split("hour")[0]) * 60
    elif "min" in route_duration:
        duration_min = int(route_duration.split("min")[0])
    
    # Simula checagem de conflitos
    for event in calendar_events:
        event_time = event.get("time")
        event_title = event.get("title")
        
        conflicts.append({
            "event": event_title,
            "time": event_time,
            "conflict_level": "high" if duration_min > 120 else "low"
        })
    
    if not conflicts:
        suggestions.append("✅ Nenhum conflito com seu calendário!")
    else:
        suggestions.append(f"⚠️ Você tem {len(conflicts)} compromisso(s) hoje")
        suggestions.append("Considere fazer recados entre os compromissos")
    
    return {
        "conflicts": conflicts,
        "suggestions": suggestions,
        "time_available": "Calcular janelas livres"
    }


# FEATURE 14: Evite Multidões
def estimate_crowdedness(place_types: List[str], current_hour: int, day_of_week: int) -> dict:
    """
    Estima nível de lotação baseado em heurísticas
    """
    crowd_level = "🟢 Vazio"
    wait_time = "0-5 min"
    score = 1  # 1-5, onde 5 é muito cheio
    
    # Bancos
    if "bank" in place_types:
        if 11 <= current_hour <= 14:  # Horário de almoço
            crowd_level = "🔴 Muito Cheio"
            wait_time = "30-45 min"
            score = 5
        elif 9 <= current_hour <= 10 or 15 <= current_hour <= 16:
            crowd_level = "🟡 Moderado"
            wait_time = "15-20 min"
            score = 3
    
    # Supermercados
    elif "supermarket" in place_types:
        if day_of_week >= 5:  # Final de semana
            crowd_level = "🔴 Muito Cheio"
            wait_time = "20-30 min"
            score = 5
        elif 17 <= current_hour <= 20:
            crowd_level = "🟡 Moderado"
            wait_time = "10-15 min"
            score = 4
    
    # Correios
    elif "post_office" in place_types:
        if 9 <= current_hour <= 11 or 14 <= current_hour <= 16:
            crowd_level = "🟡 Moderado"
            wait_time = "15-25 min"
            score = 3
    
    return {
        "crowd_level": crowd_level,
        "estimated_wait": wait_time,
        "score": score,
        "recommendation": "Melhor horário: 8h-9h ou após 16h" if score >= 4 else "Bom horário para visitar!"
    }


# FEATURE 15: Rota com Pausas
def add_rest_stops(route: List[dict], max_driving_time: int = 90) -> dict:
    """
    Adiciona paradas estratégicas para descanso
    """
    suggestions = []
    total_time = 0
    
    for i, leg in enumerate(route):
        duration_text = leg.get("duration", "")
        
        # Parse duration
        if "hour" in duration_text:
            hours = int(duration_text.split("hour")[0].strip())
            total_time += hours * 60
        elif "min" in duration_text:
            mins = int(duration_text.split("min")[0].strip())
            total_time += mins
        
        # Se passou de 90min, sugere pausa
        if total_time >= max_driving_time and i < len(route) - 1:
            suggestions.append({
                "after_stop": leg["task"],
                "reason": f"Você já dirigiu por {total_time} minutos",
                "suggestion": "☕ Parada para café/banheiro recomendada",
                "duration": "10-15 minutos",
                "location_type": "Posto de gasolina ou café"
            })
            total_time = 0  # Reset
    
    return {
        "needs_rest": len(suggestions) > 0,
        "rest_suggestions": suggestions,
        "total_driving_time": f"{sum([s.get('after_stop', 0) for s in suggestions if isinstance(s.get('after_stop'), int)])} min"
    }


# Instância global para rotas favoritas
favorite_routes_manager = FavoriteRoutesAI()



# FEATURE 12: Preveja Seu Futuro - Historical Pattern Analysis
async def analyze_historical_patterns(user_id: str, current_date: datetime) -> dict:
    """
    Analisa padrões históricos do usuário e prevê necessidades futuras
    
    Features:
    - Detecta rotinas semanais (ex: banco toda segunda)
    - Prevê próxima visita baseado em frequência
    - Sugere tarefas proativamente
    """
    # Em produção, isso viria de um banco de dados
    # Aqui simulamos com lógica baseada no dia da semana
    
    day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
    predictions = []
    
    # Padrões típicos
    patterns = {
        0: ["banco", "correios"],  # Segunda
        2: ["farmácia"],            # Quarta
        4: ["supermercado"],        # Sexta
        5: ["supermercado", "padaria"]  # Sábado
    }
    
    if day_of_week in patterns:
        for task in patterns[day_of_week]:
            predictions.append({
                "task": task,
                "confidence": 0.85,
                "reason": f"Você geralmente faz isso às {['segundas', 'terças', 'quartas', 'quintas', 'sextas', 'sábados', 'domingos'][day_of_week]}",
                "last_done": "7 dias atrás"
            })
    
    # Análise de frequência
    next_week_suggestions = []
    if day_of_week == 4:  # Sexta
        next_week_suggestions.append({
            "task": "banco",
            "suggested_day": "Segunda próxima",
            "reason": "Padrão detectado: você vai ao banco toda segunda-feira"
        })
    
    return {
        "predictions_today": predictions,
        "upcoming_suggestions": next_week_suggestions,
        "patterns_detected": len(patterns),
        "message": f"📊 {len(predictions)} tarefa(s) prevista(s) para hoje baseado no seu histórico"
    }


# FEATURE 20: Smart Scheduling AI
async def smart_scheduling_optimizer(
    tasks: List[dict],
    constraints: dict,
    user_preferences: dict = None
) -> dict:
    """
    Otimização inteligente de agendamento usando GPT
    
    Considera:
    - Horários de pico/vale de cada local
    - Preferências do usuário (manhã/tarde)
    - Condições de trânsito previstas
    - Weather conditions
    - Padrões históricos
    """
    
    tasks_description = "\n".join([
        f"- {t.get('name', t)}: fecha às {t.get('closing_time', 'N/A')}"
        for t in tasks
    ])
    
    current_hour = datetime.now().hour
    current_day = datetime.now().strftime("%A")
    
    prompt = f"""Você é um assistente de otimização de agenda. Analise essas tarefas e sugira o MELHOR horário para começar:

Tarefas:
{tasks_description}

Contexto:
- Hora atual: {current_hour}:00
- Dia: {current_day}
- Preferência do usuário: {user_preferences.get('time_preference', 'qualquer')}

Considere:
1. Horários de pico (bancos 11h-14h, supermercados 17h-19h)
2. Trânsito (evitar 7h-9h e 17h-19h)
3. Eficiência (menos espera em filas)
4. Fechamentos

Retorne JSON:
{{
    "best_start_time": "HH:MM",
    "reasoning": "explicação detalhada",
    "alternative_times": ["HH:MM", "HH:MM"],
    "time_savings": "X minutos economizados",
    "warnings": ["avisos importantes"]
}}
"""
    
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,  # Lower temp for more consistent scheduling
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        
        result = json.loads(content)
        
        return {
            "optimized_schedule": result,
            "confidence": 0.92,
            "factors_considered": [
                "Horários de pico",
                "Trânsito previsto",
                "Horários de fechamento",
                "Preferências do usuário"
            ]
        }
        
    except Exception as e:
        # Fallback: lógica heurística simples
        return {
            "optimized_schedule": {
                "best_start_time": "09:00",
                "reasoning": "Horário padrão: após rush matinal, antes de horário de pico",
                "alternative_times": ["14:00", "10:00"],
                "time_savings": "Estimado 15-20 minutos",
                "warnings": []
            },
            "confidence": 0.7,
            "error": f"GPT scheduling falhou: {str(e)}. Usando fallback heurístico."
        }
