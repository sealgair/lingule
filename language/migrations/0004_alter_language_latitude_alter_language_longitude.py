# Generated by Django 4.0.3 on 2022-05-01 15:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('language', '0003_alter_language_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='language',
            name='latitude',
            field=models.FloatField(),
        ),
        migrations.AlterField(
            model_name='language',
            name='longitude',
            field=models.FloatField(),
        ),
    ]