# Generated by Django 5.1.2 on 2024-12-10 22:25

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventarioapi', '0007_itempedido_subtotal_alter_itempedido_pedido_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Envio',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('estado', models.CharField(choices=[('En Proceso', 'En Proceso'), ('Enviado', 'Enviado'), ('Recibido', 'Recibido')], default='En Proceso', max_length=20)),
                ('proveedor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='envios', to='inventarioapi.proveedor')),
            ],
        ),
    ]
