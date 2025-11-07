"""
Script simples para testar a API sem precisar do frontend
"""

import requests
import json

def test_optimize_errands():
    url = "http://localhost:8000/api/optimize-errands"
    
    payload = {
        "user_input": "Preciso ir ao banco (que fecha às 16h), passar na farmácia, buscar uma encomenda nos Correios (fecha às 17h) e comprar pão na volta.",
        "start_address": "Av. Paulista, 1578, São Paulo, SP",
        "start_time": "15:00"
    }
    
    print("🚀 Testando API de otimização de recados...\n")
    print(f"📍 Endereço de partida: {payload['start_address']}")
    print(f"⏰ Horário de saída: {payload['start_time']}")
    print(f"📝 Recados: {payload['user_input']}\n")
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        
        print("✅ Sucesso!\n")
        print(f"⏱️  Tempo total: {result['total_duration']}")
        print(f"📏 Distância total: {result['total_distance']}\n")
        
        if result['warnings']:
            print("⚠️  Avisos:")
            for warning in result['warnings']:
                print(f"   - {warning}")
            print()
        
        print("🗺️  Rota otimizada:")
        for i, leg in enumerate(result['optimized_route'], 1):
            print(f"\n{i}. {leg['task']}")
            print(f"   📍 {leg['address']}")
            print(f"   🕐 Chegada: {leg['arrival_time']}")
            if leg['closing_time']:
                print(f"   🔒 Fecha: {leg['closing_time']}")
            print(f"   ⏱️  {leg['duration']} • {leg['distance']}")
        
        print("\n" + "="*50)
        print("JSON completo:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao backend.")
        print("   Certifique-se de que o servidor está rodando em http://localhost:8000")
    except requests.exceptions.HTTPError as e:
        print(f"❌ Erro HTTP: {e}")
        print(f"   Response: {e.response.text}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_optimize_errands()

