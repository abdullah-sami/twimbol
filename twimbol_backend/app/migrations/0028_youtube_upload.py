# Generated by Django 5.1.7 on 2025-03-25 19:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0027_post_created_by'),
    ]

    operations = [
        migrations.CreateModel(
            name='Youtube_Upload',
            fields=[
                ('post', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='youtube_upload', serialize=False, to='app.post')),
                ('video_id', models.CharField(max_length=100)),
                ('video_title', models.CharField(max_length=100)),
                ('video_description', models.TextField(null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]
