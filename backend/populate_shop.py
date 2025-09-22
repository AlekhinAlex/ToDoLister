import os
import sys
import random
import django

# Добавляем корень проекта в PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Указываем Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

# Настроить Django
django.setup()

from todoDataBase.models import Shop, Rank

def detect_type(file_path):
    # file_path - полный путь до картинки
    parts = file_path.split(os.sep)
    if 'characters' in parts:
        index = parts.index('characters')
        if index + 1 < len(parts):
            folder_name = parts[index + 1]
            return folder_name
    return None

def main():
    # Проверяем, есть ли уже данные в магазине
    if Shop.objects.exists():
        print("Магазин уже заполнен, пропускаем создание предметов.")
        return
    
    # Проверяем, есть ли ранги
    if not Rank.objects.exists():
        print("Сначала нужно загрузить ранги!")
        return

    print("Начинаем заполнение магазина...")

    # Путь до папки с картинками (адаптирован для Render)
    MEDIA_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'media/shop_items/characters')
    
    # Используем относительные пути для production
    BASE_DOMAIN = os.environ.get('RENDER_EXTERNAL_URL', 'http://localhost:8000')

    # Загружаем все ранги в словарь для быстрого доступа по XP
    xp_to_rank = {rank.required_xp: rank for rank in Rank.objects.all()}

    # Создаем несколько стандартных предметов, если папки с картинками нет
    if not os.path.exists(MEDIA_ROOT):
        print("Папка с изображениями не найдена, создаем стандартные предметы...")
        
        default_items = [
            {
                'type': 'warrior',
                'name': 'warrior_default',
                'description': 'Стандартный воин',
                'price': 0,
                'is_default': True,
                'image_preview_url': f'{BASE_DOMAIN}/static/default_images/warrior.png',
                'image_character_url': f'{BASE_DOMAIN}/static/default_images/warrior.png',
            },
            {
                'type': 'mage', 
                'name': 'mage_default',
                'description': 'Стандартный маг',
                'price': 0,
                'is_default': True,
                'image_preview_url': f'{BASE_DOMAIN}/static/default_images/mage.png',
                'image_character_url': f'{BASE_DOMAIN}/static/default_images/mage.png',
            }
        ]
        
        for item_data in default_items:
            Shop.objects.create(
                type=item_data['type'],
                name=item_data['name'],
                description=item_data['description'],
                required_rank=None,
                price=item_data['price'],
                is_default=item_data['is_default'],
                image_preview_url=item_data['image_preview_url'],
                image_character_url=item_data['image_character_url'],
            )
            print(f"Добавлен стандартный предмет: {item_data['name']}")
        
        return

    # Если папка с изображениями существует, обрабатываем файлы
    for root, dirs, files in os.walk(MEDIA_ROOT):
        for filename in files:
            if filename.endswith(('.png', '.jpg', '.jpeg')):
                full_path = os.path.join(root, filename)
                item_type = detect_type(full_path)
                if not item_type:
                    print(f"Не удалось определить тип для файла {filename}")
                    continue

                name = filename.split('.')[0]
                is_default = 'default' in name.lower()
                description = f"Описание для {name}"

                if is_default:
                    price = 0
                    required_rank = None
                else:
                    price = random.randint(50, 500)
                    available_ranks = list(Rank.objects.exclude(required_xp=0))
                    required_rank = random.choice(available_rank) if available_ranks else None

                # Создаем относительный URL
                relative_path = os.path.relpath(full_path, os.path.dirname(os.path.dirname(MEDIA_ROOT)))
                url_path = relative_path.replace(os.sep, '/')
                media_url = f"{BASE_DOMAIN}/media/{url_path}"

                Shop.objects.create(
                    type=item_type,
                    name=name,
                    description=description,
                    required_rank=required_rank,
                    price=price,
                    is_default=is_default,
                    image_preview_url=media_url,
                    image_character_url=media_url,
                )
                print(f"Добавлен предмет: {name}")

if __name__ == '__main__':
    main()