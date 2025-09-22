#!/usr/bin/env python3
import os
import sys
import django
from django.core.management import call_command

# ---- Настройка пути / Django ----
# предполагаем, что populate_shop.py лежит в корне репозитория (или в /backend)
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
# если у тебя структура другая — скорректируй PROJECT_ROOT
sys.path.append(PROJECT_ROOT)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from todoDataBase.models import Shop, Rank  # импорт после django.setup()

def try_load_fixture():
    """
    Попытаемся найти и загрузить fixture initiate_ranks.json из стандартных мест.
    Возвращает True если загрузили, False если не нашли/ошибка.
    """
    possible_paths = [
        os.path.join(PROJECT_ROOT, 'backend', 'fixtures', 'initiate_ranks.json'),
        os.path.join(PROJECT_ROOT, 'fixtures', 'initiate_ranks.json'),
        os.path.join(PROJECT_ROOT, 'todoDataBase', 'fixtures', 'initiate_ranks.json'),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            print(f"Found ranks fixture at: {p} — loading via loaddata")
            try:
                call_command('loaddata', p)
                return True
            except Exception as e:
                print(f"Error loading fixture {p}: {e}")
                return False
    print("No fixture file found in standard locations.")
    return False

def ensure_ranks():
    """
    Гарантируем, что в таблице Rank есть записи.
    Если нет — сначала пробуем загрузить фикстуру, если её нет — создаём базовые ранги вручную.
    """
    if Rank.objects.exists():
        print("Ranks already exist in DB — пропускаем загрузку.")
        return

    loaded = try_load_fixture()
    if loaded and Rank.objects.exists():
        print("Ranks loaded from fixture.")
        return

    # Если фикстура не найдена или не сработала — создаём базовые ранги
    print("Creating default ranks programmatically...")
    default_ranks = [
        {"name": "Новичок", "level": 1, "required_xp": 0},
        {"name": "Ученик", "level": 2, "required_xp": 100},
        {"name": "Продвинутый", "level": 3, "required_xp": 300},
        {"name": "Эксперт", "level": 4, "required_xp": 700},
        {"name": "Легенда", "level": 5, "required_xp": 1500},
    ]
    for r in default_ranks:
        obj, created = Rank.objects.get_or_create(name=r["name"], defaults={
            "level": r["level"],
            "required_xp": r["required_xp"],
        })
        if created:
            print(f"Created rank: {obj.name}")
    print("Default ranks ensured.")

def populate_shop():
    """
    Пример наполнения магазина. Подставь свою логику/массив items.
    Важно: вызываем ensure_ranks() перед тем, как присваивать required_rank.
    """
    ensure_ranks()

    # Пример: список предметов — измени под себя
    items = [
        {"name": "Энергетик", "price": 10, "required_rank_name": "Новичок", "description": "Восстанавливает энергию", "is_default": False},
        {"name": "Амулет опыта", "price": 50, "required_rank_name": "Ученик", "description": "+10% XP на 1 час", "is_default": False},
        {"name": "Шлем героя", "price": 200, "required_rank_name": "Эксперт", "description": "Крутота +5", "is_default": False},
    ]

    for item in items:
        # Найдём required_rank по имени (или поставим None)
        req_rank = None
        if item.get("required_rank_name"):
            req_rank = Rank.objects.filter(name=item["required_rank_name"]).first()
            if req_rank is None:
                print(f"Warning: Rank '{item['required_rank_name']}' not found — using lowest rank instead.")
                req_rank = Rank.objects.order_by('level').first()

        shop_obj, created = Shop.objects.get_or_create(
            name=item["name"],
            defaults={
                "description": item.get("description", ""),
                "price": item.get("price", 0),
                "required_rank": req_rank,
                "is_default": item.get("is_default", False),
            }
        )
        if created:
            print(f"Добавлен предмет: {shop_obj.name}")
        else:
            print(f"Предмет уже существует: {shop_obj.name} — обновим цену/описание.")
            shop_obj.price = item.get("price", shop_obj.price)
            shop_obj.description = item.get("description", shop_obj.description)
            shop_obj.required_rank = req_rank or shop_obj.required_rank
            shop_obj.save()

def main():
    populate_shop()

if __name__ == '__main__':
    main()
