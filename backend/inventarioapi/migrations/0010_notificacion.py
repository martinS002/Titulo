# Generated by Django 5.1.2 on 2024-12-11 21:06

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventarioapi', '0009_alter_envio_options_envio_descripcion_alter_envio_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notificacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mensaje', models.TextField()),
                ('fecha_creacion', models.DateTimeField(default=django.utils.timezone.now)),
                ('leida', models.BooleanField(default=False)),
                ('producto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notificaciones', to='inventarioapi.inventario')),
            ],
            options={
                'ordering': ['-fecha_creacion'],
            },
        ),
    ]