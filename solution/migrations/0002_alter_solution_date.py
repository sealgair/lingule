# Generated by Django 4.0.3 on 2022-05-03 20:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('solution', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='solution',
            name='date',
            field=models.DateField(blank=True, null=True),
        ),
    ]
