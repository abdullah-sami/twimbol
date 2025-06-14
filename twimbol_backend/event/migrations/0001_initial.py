# Generated by Django 5.1.7 on 2025-04-13 16:24

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('app', '0035_post_stat_like'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Events',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_title', models.CharField(max_length=100)),
                ('event_date', models.DateTimeField()),
                ('event_description', models.TextField(blank=True, null=True)),
                ('event_type', models.CharField(choices=[('reel_challenge', 'Reel Challenge'), ('photography_competition', 'Photography Competition'), ('video_challenge', 'Video Challenge'), ('ceremony', 'Cermony'), ('other', 'Other')], max_length=50)),
                ('event_banner', models.ImageField(blank=True, default='img/event_banners/default_event_banner.jpg', null=True, upload_to='img/event_banners/')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='event_created', to=settings.AUTH_USER_MODEL)),
                ('participants', models.ManyToManyField(blank=True, related_name='event_participated', to=settings.AUTH_USER_MODEL)),
                ('posts', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='event_post', to='app.post')),
            ],
        ),
    ]
