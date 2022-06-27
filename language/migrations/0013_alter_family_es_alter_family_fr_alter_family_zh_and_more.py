# Generated by Django 4.0.3 on 2022-06-20 22:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('language', '0012_alter_genus_subfamily'),
    ]

    operations = [
        migrations.AlterField(
            model_name='family',
            name='es',
            field=models.TextField(blank=True, verbose_name='spanish'),
        ),
        migrations.AlterField(
            model_name='family',
            name='fr',
            field=models.TextField(blank=True, verbose_name='french'),
        ),
        migrations.AlterField(
            model_name='family',
            name='zh',
            field=models.TextField(blank=True, verbose_name='chinese'),
        ),
        migrations.AlterField(
            model_name='genus',
            name='es',
            field=models.TextField(blank=True, verbose_name='spanish'),
        ),
        migrations.AlterField(
            model_name='genus',
            name='fr',
            field=models.TextField(blank=True, verbose_name='french'),
        ),
        migrations.AlterField(
            model_name='genus',
            name='zh',
            field=models.TextField(blank=True, verbose_name='chinese'),
        ),
        migrations.AlterField(
            model_name='language',
            name='es',
            field=models.TextField(blank=True, verbose_name='spanish'),
        ),
        migrations.AlterField(
            model_name='language',
            name='fr',
            field=models.TextField(blank=True, verbose_name='french'),
        ),
        migrations.AlterField(
            model_name='language',
            name='zh',
            field=models.TextField(blank=True, verbose_name='chinese'),
        ),
        migrations.AlterField(
            model_name='macroarea',
            name='es',
            field=models.TextField(blank=True, verbose_name='spanish'),
        ),
        migrations.AlterField(
            model_name='macroarea',
            name='fr',
            field=models.TextField(blank=True, verbose_name='french'),
        ),
        migrations.AlterField(
            model_name='macroarea',
            name='zh',
            field=models.TextField(blank=True, verbose_name='chinese'),
        ),
        migrations.AlterField(
            model_name='subfamily',
            name='es',
            field=models.TextField(blank=True, verbose_name='spanish'),
        ),
        migrations.AlterField(
            model_name='subfamily',
            name='fr',
            field=models.TextField(blank=True, verbose_name='french'),
        ),
        migrations.AlterField(
            model_name='subfamily',
            name='zh',
            field=models.TextField(blank=True, verbose_name='chinese'),
        ),
    ]