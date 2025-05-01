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

from todoDataBase.models import Shop

# Путь до папки с картинками
MEDIA_ROOT = 'media/shop_items/characters'
BASE_URL = 'http://localhost:8000/media/shop_items/characters'

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
    Shop.objects.all().delete()
    print("Очищены все старые предметы из магазина.")

    for root, dirs, files in os.walk(MEDIA_ROOT):  # теперь обходим все подпапки
        for filename in files:
            if filename.endswith('.png') or filename.endswith('.jpg'):
                full_path = os.path.join(root, filename)
                item_type = detect_type(full_path)
                if not item_type:
                    print(f"Не удалось определить тип для файла {filename}")
                    continue

                name = filename.split('.')[0]  # без расширения

                # --- здесь важно ---
                is_default= 'default' in name  # будет True если "default" в имени
                # -------------------

                description = f"Описание для {name}"

                # Ценообразование
                required_xp = random.choice([0]) #  , 100, 200, 300, 500
                price = random.choice([0]) #50, 100, 200, 400, 800])
                is_unlocked = False
                # Получаем путь относительно MEDIA_ROOT
                relative_path = os.path.relpath(full_path, 'media')
                url_path = relative_path.replace(os.sep, '/')

                preview_url = f"http://localhost:8000/media/{url_path}"
                character_url = f"http://localhost:8000/media/{url_path}"

                Shop.objects.create(
                    type=item_type,
                    name=name,
                    description=description,
                    required_xp=required_xp,
                    price=price,
                    is_default=is_default,
                    image_preview_url=preview_url,
                    image_character_url=character_url,
                )
                print(f"Добавлен предмет: {name}")

if __name__ == '__main__':
    main()
