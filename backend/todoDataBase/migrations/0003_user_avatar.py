# Generated by Django 4.2.20 on 2025-04-19 16:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('todoDataBase', '0002_character_xp'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.ImageField(blank=True, null=True, upload_to='avatars/'),
        ),
    ]
