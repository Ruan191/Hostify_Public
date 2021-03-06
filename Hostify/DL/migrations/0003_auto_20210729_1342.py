# Generated by Django 3.2.5 on 2021-07-29 11:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('DL', '0002_auto_20210726_1654'),
    ]

    operations = [
        migrations.AddField(
            model_name='log',
            name='char_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='log',
            name='max_chars_allowed',
            field=models.IntegerField(default=10000),
        ),
        migrations.AddField(
            model_name='user',
            name='hasPremium',
            field=models.BooleanField(default=False),
        ),
    ]
