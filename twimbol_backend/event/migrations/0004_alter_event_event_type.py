# Generated by Django 5.1.7 on 2025-04-15 18:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0003_remove_event_posts_event_posts'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='event_type',
            field=models.CharField(choices=[('reel_challenge', 'Reel Challenge'), ('video_challenge', 'Video Challenge'), ('other', 'Other')], max_length=50),
        ),
    ]
