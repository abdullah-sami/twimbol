# Generated by Django 5.1.7 on 2025-03-22 18:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Youtube_Video_Data',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video_id', models.CharField(max_length=100)),
                ('video_title', models.CharField(max_length=100)),
                ('thumbnail_url', models.URLField()),
                ('channel_title', models.CharField(max_length=100)),
                ('channel_image_url', models.URLField()),
                ('view_count', models.IntegerField()),
                ('like_count', models.IntegerField()),
            ],
        ),
    ]
