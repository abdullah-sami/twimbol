# Generated by Django 5.1.7 on 2025-03-22 19:29

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_youtube_video_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('post_type', models.CharField(max_length=100)),
            ],
        ),
        migrations.RemoveField(
            model_name='youtube_video_data',
            name='id',
        ),
        migrations.AddField(
            model_name='youtube_video_data',
            name='post',
            field=models.OneToOneField(default=1, on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='video_data', serialize=False, to='app.post'),
        ),
    ]
