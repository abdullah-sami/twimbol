# Generated by Django 5.1.7 on 2025-03-25 08:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0016_post_created_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='created_by',
            field=models.CharField(default='asib', max_length=100),
            preserve_default=False,
        ),
    ]
