# Generated by Django 4.0.3 on 2022-05-08 08:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('solution', '0004_solution_romanization'),
    ]

    operations = [
        migrations.AddField(
            model_name='solution',
            name='font',
            field=models.FilePathField(blank=True, recursive=True, path='/Users/chase/code/lingule/fonts'),
        ),
    ]
