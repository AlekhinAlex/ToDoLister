#!/usr/bin/env python3
import os
import sys
import random
import django
from django.core.management import call_command

# ---- Настройка PYTHONPATH и Django ----
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))  # предполагаем, что скрипт лежит в корне репо
sys.path.append(PROJECT_ROOT)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

# ---- Импорт моделей после django.setup() ----
from todoDataBase.models import Shop, Rank

# ---- Функции для загрузки/создания рангов ----
def try_load_fixture():
    """
    Попытаемся найти и загрузить fixture initiate_ranks.json из стандартных мест.
    Возвращает True если загрузили успешно, False в противном случае.
    """
    possible_paths = [
        os.path.join(PROJECT_ROOT, 'backend', 'fixtures', 'initiate_ranks.json'),
        os.path.join(PROJECT_ROOT, 'fixtures', 'initiate_ranks.json'),
        os.path.join(PROJECT_ROOT, 'todoDataBase', 'fixtures', 'initiate_ranks.json'),
        os.path.join(PROJECT_ROOT, 'backend', 'todoDataBase', 'fixtures', 'initiate_ranks.json'),
        os.path.join(PROJECT_ROOT, 'initiate_ranks.json'),
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
        print("Ranks already exist in DB — skipping creation.")
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


# ---- Вспомогательные функции для обработки медиа и определения типа ----
def detect_type(file_path):
    """
    Определяет тип предмета по пути (ищет папку 'characters' и берет следующую часть пути).
    Возвращает None если не удалось.
    """
    parts = file_path.split(os.sep)
    if 'characters' in parts:
        index = parts.index('characters')
        if index + 1 < len(parts):
            folder_name = parts[index + 1]
            return folder_name
    return None

def build_media_url(full_path, base_domain):
    """
    Строит публичный URL для файла, предполагая, что PROJECT_ROOT/media/... доступен по /media/...
    Возвращает base_domain + '/' + относительный путь от PROJECT_ROOT (с заменой разделителей).
    """
    rel = os.path.relpath(full_path, PROJECT_ROOT)
    rel = rel.replace(os.sep, '/')
    # Если rel уже содержит 'media/', не добавляем лишнего
    if rel.startswith('media/'):
        return f"{base_domain.rstrip('/')}/{rel}"
    return f"{base_domain.rstrip('/')}/media/{rel}"


# ---- Основная логика наполнения магазина ----
def populate_shop():
    # Если магазин уже заполнен — пропускаем (как в твоём варианте)
    if Shop.objects.exists():
        print("Магазин уже заполнен, пропускаем создание предметов.")
        return

    # Убедимся, что ранги есть (если нет — загрузим/создадим)
    ensure_ranks()

    if not Rank.objects.exists():
        print("After ensuring, no ranks exist - aborting shop population to avoid FK issues.")
        return

    print("Начинаем заполнение магазина...")

    # Расположение медиа (адаптировано для Render и локальной разработки)
    MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'media', 'shop_items', 'characters')
    BASE_DOMAIN = os.environ.get('RENDER_EXTERNAL_URL') or os.environ.get('BASE_DOMAIN') or 'http://localhost:8000'

    # Если нет папки с изображениями — создаем несколько дефолтных предметов
    if not os.path.exists(MEDIA_ROOT):
        print("Папка с изображениями не найдена, создаем стандартные предметы...")
        default_items = [
            {
                'type': 'warrior',
                'name': 'warrior_default',
                'description': 'Стандартный воин',
                'price': 0,
                'is_default': True,
                'image_preview_url': f'{BASE_DOMAIN.rstrip("/")}/static/default_images/warrior.png',
                'image_character_url': f'{BASE_DOMAIN.rstrip("/")}/static/default_images/warrior.png',
            },
            {
                'type': 'mage',
                'name': 'mage_default',
                'description': 'Стандартный маг',
                'price': 0,
                'is_default': True,
                'image_preview_url': f'{BASE_DOMAIN.rstrip("/")}/static/default_images/mage.png',
                'image_character_url': f'{BASE_DOMAIN.rstrip("/")}/static/default_images/mage.png',
            }
        ]

        for item_data in default_items:
            obj, created = Shop.objects.get_or_create(
                name=item_data['name'],
                defaults={
                    'type': item_data['type'],
                    'description': item_data['description'],
                    'required_rank': None,
                    'price': item_data['price'],
                    'is_default': item_data['is_default'],
                    'image_preview_url': item_data['image_preview_url'],
                    'image_character_url': item_data['image_character_url'],
                }
            )
            print(f"{'Добавлен' if created else 'Существовал'} стандартный предмет: {obj.name}")
        return

    # Если папка с изображениями существует — обрабатываем файлы
    created_count = 0
    for root, dirs, files in os.walk(MEDIA_ROOT):
        for filename in files:
            if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
                continue

            full_path = os.path.join(root, filename)
            item_type = detect_type(full_path)
            if not item_type:
                print(f"Не удалось определить тип для файла {filename}, пропускаем.")
                continue

            name = os.path.splitext(filename)[0]
            is_default = 'default' in name.lower()
            description = f"Описание для {name}"

            if is_default:
                price = 0
                required_rank = None
            else:
                price = random.randint(50, 500)
                # Выбираем случайный ранк, исключая нулевой (если есть)
                available_ranks = list(Rank.objects.exclude(required_xp=0))
                if available_ranks:
                    required_rank = random.choice(available_ranks)
                else:
                    required_rank = Rank.objects.order_by('level').first()

            # Формируем публичный URL для файла
            media_url = build_media_url(full_path, BASE_DOMAIN)

            # Создаем объект магазина (избегаем дублирования по имени)
            shop_obj, created = Shop.objects.get_or_create(
                name=name,
                defaults={
                    'type': item_type,
                    'description': description,
                    'required_rank': required_rank,
                    'price': price,
                    'is_default': is_default,
                    'image_preview_url': media_url,
                    'image_character_url': media_url,
                }
            )
            if created:
                created_count += 1
                print(f"Добавлен предмет: {name} (type={item_type}, price={price}, rank={getattr(required_rank, 'name', None)})")
            else:
                # Обновляем данные на случай изменений
                updated = False
                if shop_obj.price != price:
                    shop_obj.price = price
                    updated = True
                if shop_obj.description != description:
                    shop_obj.description = description
                    updated = True
                if shop_obj.required_rank != required_rank:
                    shop_obj.required_rank = required_rank
                    updated = True
                if shop_obj.image_preview_url != media_url or shop_obj.image_character_url != media_url:
                    shop_obj.image_preview_url = media_url
                    shop_obj.image_character_url = media_url
                    updated = True
                if updated:
                    shop_obj.save()
                    print(f"Обновлён предмет: {name}")
                else:
                    print(f"Предмет уже существует без изменений: {name}")

    print(f"Готово. Добавлено предметов: {created_count}")


if __name__ == '__main__':
    try:
        populate_shop()
    except Exception as e:
        print("Ошибка при заполнении магазина:", e)
        raise
