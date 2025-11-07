"""
Melhoria #7: Cache Inteligente
Sistema de cache para reduzir chamadas às APIs e melhorar performance
"""

from functools import lru_cache
from typing import Optional, Tuple
import hashlib
import json
from datetime import datetime, timedelta

# Cache em memória simples (em produção, usar Redis)
_memory_cache = {}
_cache_timestamps = {}

# TTL padrão: 1 hora para lugares, 5 minutos para rotas
CACHE_TTL_PLACES = 3600  # 1 hora
CACHE_TTL_ROUTES = 300   # 5 minutos


def get_cache_key(prefix: str, *args, **kwargs) -> str:
    """
    Gera uma chave de cache única baseada nos argumentos
    """
    data = {
        'prefix': prefix,
        'args': args,
        'kwargs': sorted(kwargs.items())
    }
    data_str = json.dumps(data, sort_keys=True, default=str)
    return hashlib.md5(data_str.encode()).hexdigest()


def get_cached(key: str, ttl: int = CACHE_TTL_PLACES) -> Optional[any]:
    """
    Recupera valor do cache se ainda válido
    """
    if key not in _memory_cache:
        return None
    
    # Verifica se expirou
    if key in _cache_timestamps:
        timestamp = _cache_timestamps[key]
        if datetime.now() - timestamp > timedelta(seconds=ttl):
            # Expirou, remove do cache
            del _memory_cache[key]
            del _cache_timestamps[key]
            return None
    
    return _memory_cache[key]


def set_cached(key: str, value: any) -> None:
    """
    Armazena valor no cache
    """
    _memory_cache[key] = value
    _cache_timestamps[key] = datetime.now()


def cache_place_search(query: str, lat: float, lng: float):
    """
    Decorator para cachear buscas de lugares
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            cache_key = get_cache_key('place_search', query, lat, lng)
            
            # Tenta recuperar do cache
            cached_result = get_cached(cache_key, CACHE_TTL_PLACES)
            if cached_result is not None:
                print(f"✅ Cache HIT: place_search {query}")
                return cached_result
            
            # Não está no cache, executa função
            print(f"❌ Cache MISS: place_search {query}")
            result = func(*args, **kwargs)
            
            # Armazena no cache
            set_cached(cache_key, result)
            
            return result
        return wrapper
    return decorator


def cache_geocoding(address: str):
    """
    Decorator para cachear geocoding
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            cache_key = get_cache_key('geocoding', address)
            
            cached_result = get_cached(cache_key, CACHE_TTL_PLACES)
            if cached_result is not None:
                print(f"✅ Cache HIT: geocoding {address[:30]}...")
                return cached_result
            
            print(f"❌ Cache MISS: geocoding {address[:30]}...")
            result = func(*args, **kwargs)
            set_cached(cache_key, result)
            
            return result
        return wrapper
    return decorator


def get_cache_stats() -> dict:
    """
    Retorna estatísticas do cache
    """
    return {
        "total_entries": len(_memory_cache),
        "cache_size_kb": len(str(_memory_cache)) / 1024,
        "oldest_entry": min(_cache_timestamps.values()) if _cache_timestamps else None,
        "newest_entry": max(_cache_timestamps.values()) if _cache_timestamps else None
    }


def clear_cache() -> None:
    """
    Limpa todo o cache
    """
    _memory_cache.clear()
    _cache_timestamps.clear()
    print("🗑️  Cache limpo!")


def clear_expired_cache() -> int:
    """
    Remove apenas entradas expiradas
    Retorna quantidade de itens removidos
    """
    now = datetime.now()
    expired_keys = []
    
    for key, timestamp in _cache_timestamps.items():
        # Usa o maior TTL como padrão
        if now - timestamp > timedelta(seconds=CACHE_TTL_PLACES):
            expired_keys.append(key)
    
    for key in expired_keys:
        del _memory_cache[key]
        del _cache_timestamps[key]
    
    if expired_keys:
        print(f"🗑️  Removidos {len(expired_keys)} itens expirados do cache")
    
    return len(expired_keys)

