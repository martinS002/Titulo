from django.contrib.auth.models import AbstractUser
from inventario import settings
import os
from django.core.files.storage import default_storage
from django.db import models
import uuid
from django.utils import timezone
from supabase import create_client, Client
from io import BytesIO
from decimal import Decimal

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Inventario(models.Model):
    id = models.AutoField(primary_key=True)
    codigo_producto = models.CharField(max_length=100, unique=True)
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField()
    precio_compra = models.IntegerField()
    precio_venta = models.IntegerField()
    stock = models.IntegerField()
    stock_minimo = models.IntegerField()
    categoria = models.CharField(max_length=100)
    fecha_ingreso = models.DateTimeField(auto_now_add=True)
    user = models.UUIDField(default=uuid.uuid4, editable=False)
    imagen = models.ImageField(upload_to='producto/', null=True, blank=True)

    class Meta:
        db_table = 'inventario'
        db_table_comment = 'productos del inventario'

    def save(self, *args, **kwargs):
        if self.stock <= self.stock_minimo:
            Notificacion.objects.create(
                producto=self,
                mensaje=f"¡El producto {self.nombre} está llegando al stock mínimo! (Stock actual: {self.stock})"
            )
        if self.imagen:
            try:
                ext = os.path.splitext(self.imagen.name)[1]
                filename = f'producto/{self.codigo_producto}-{self.id}{ext}'
                image_file = BytesIO(self.imagen.read())
                response = supabase.storage.from_('ImagenProductos').upload(
                    filename,
                    image_file,
                    {"content-type": self.imagen.file.content_type}
                )
                if response.get('error'):
                    raise Exception(f"Error al subir imagen a Supabase: {response['error']}")
                image_url = f"{settings.SUPABASE_URL}/storage/v3/object/public/ImagenProductos/{filename}"
                self.imagen = image_url
            except Exception as e:
                print(f"Error al guardar la imagen: {str(e)}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre


class Task(models.Model):
    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Task'


class Producto(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=0)
    stock = models.IntegerField(default=0)
    barcode = models.CharField(max_length=100, unique=True)
    imagen = models.ImageField(upload_to='productos/', null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'Producto'


class CustomUser(AbstractUser):
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customuser_groups',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customuser_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions'
    )

    def __str__(self):
        return self.username


class Ventas(models.Model):
    id = models.AutoField(primary_key=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    metodo_de_pago = models.CharField(max_length=50)
    total = models.IntegerField()
    facturacion = models.CharField(max_length=100, default='No')
    user = models.UUIDField(default=uuid.uuid4, editable=False)
    fecha_venta = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'ventas'
        db_table_comment = 'registro de ventas'

    def __str__(self):
        return f'Venta {self.id} - {self.fecha_venta}'


class DetalleVenta(models.Model):
    venta = models.ForeignKey(Ventas, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Inventario, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    precio_unitario = models.IntegerField()
    imagen_producto = models.URLField(null=True, blank=True)

    class Meta:
        db_table = 'detalle_ventas'
        db_table_comment = 'detalles de las ventas'

    def __str__(self):
        return f'Detalle de Venta {self.venta.id} - {self.producto.nombre}'

    def save(self, *args, **kwargs):
        if not self.imagen_producto and self.producto.imagen:
            self.imagen_producto = self.producto.imagen.url
        super().save(*args, **kwargs)


class Pedido(models.Model):
    numero_pedido = models.CharField(max_length=100, unique=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=50)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventarioapi_pedido'

    def __str__(self):
        return f"Pedido {self.numero_pedido} - Total: ${self.total}"


class Transaccion(models.Model):
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE, related_name='transaccion')
    id_transaccion = models.CharField(max_length=100)
    monto = models.IntegerField()
    estado = models.CharField(max_length=20)
    creado_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transacción {self.id_transaccion}"


class OrdenEnvio(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE)
    numero_orden_envio = models.CharField(max_length=100)
    referencia_envio = models.CharField(max_length=100)
    costo_envio = models.IntegerField()
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventarioapi_ordenenvio'

    def __str__(self):
        return f"Orden de envío {self.numero_orden_envio} para pedido {self.pedido.numero_pedido}"


class ItemPedido(models.Model):
    pedido = models.ForeignKey('Pedido', on_delete=models.CASCADE)
    id_producto = models.IntegerField()
    cantidad = models.IntegerField()
    precio = models.IntegerField()
    subtotal = models.IntegerField()

    class Meta:
        db_table = 'inventarioapi_itempedido'

    def save(self, *args, **kwargs):
        self.subtotal = Decimal(self.cantidad) * Decimal(self.precio)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Item {self.id_producto} del Pedido {self.pedido.numero_pedido}"


class Proveedor(models.Model):
    id = models.AutoField(primary_key=True)
    nombre_proveedores = models.CharField(max_length=255)
    producto_suministrado = models.CharField(max_length=255)
    telefono = models.CharField(max_length=20)
    correo_electronico = models.EmailField()
    metodo_de_pago = models.CharField(max_length=50)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    user = models.UUIDField(default=uuid.uuid4, editable=False)

    class Meta:
        db_table = 'proveedores'
        db_table_comment = 'proveedores de productos'

    def __str__(self):
        return self.nombre_proveedores


class Envio(models.Model):
    ESTADO_CHOICES = [
        ('En Proceso', 'En Proceso'),
        ('Enviado', 'Enviado'),
        ('Recibido', 'Recibido'),
    ]

    id = models.AutoField(primary_key=True)
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name='envios')
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='En Proceso')
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-fecha']

    def __str__(self):
        return f"Envío {self.id} - {self.proveedor.nombre_proveedores}"


class Notificacion(models.Model):
    producto = models.ForeignKey(Inventario, on_delete=models.CASCADE, related_name='notificaciones')
    mensaje = models.TextField()
    fecha_creacion = models.DateTimeField(default=timezone.now)
    leida = models.BooleanField(default=False)

    class Meta:
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f"Notificación para {self.producto.nombre}"

class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    fecha = models.DateTimeField(default=timezone.now)

    class Meta: 
        db_table = 'contact'


    def __str__(self):
        return f"{self.name} - {self.email}"