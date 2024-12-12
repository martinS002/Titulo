from rest_framework import serializers
from .models import Inventario
from .models import Producto
from .models import Task
from .models import CustomUser , Proveedor , Ventas , DetalleVenta, Notificacion, Contact

class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = '__all__'



class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = '__all__' 

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'done', 'created_at']
        read_only_fields = ("id","created_at")
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class DetalleVentaSerializer(serializers.ModelSerializer):
    producto = serializers.PrimaryKeyRelatedField(queryset=Inventario.objects.all())
    imagen_producto = serializers.URLField(read_only=True)
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = DetalleVenta
        fields = ['id', 'producto', 'cantidad', 'precio_unitario', 'imagen_producto', 'producto_nombre']

class VentasSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, required=False)
    
    class Meta:
        model = Ventas
        fields = ['id', 'fecha_creacion', 'metodo_de_pago', 'total', 'facturacion', 'user', 'fecha_venta', 'detalles']
        read_only_fields = ['fecha_creacion', 'fecha_venta']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles', [])
        venta = Ventas.objects.create(**validated_data)
        
        for detalle_data in detalles_data:
            producto = detalle_data['producto']
            cantidad_comprada = detalle_data['cantidad']
            
            producto.stock -= cantidad_comprada
            producto.save()

            DetalleVenta.objects.create(venta=venta, **detalle_data)
        
        return venta

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['fecha_venta_formatted'] = instance.fecha_venta.strftime("%Y-%m-%d %H:%M:%S")
        representation['detalles'] = DetalleVentaSerializer(
            DetalleVenta.objects.filter(venta=instance),
            many=True
        ).data
        return representation

from .models import Envio

from rest_framework import serializers
from .models import Proveedor, Envio

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'

class EnvioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Envio
        fields = ['id', 'proveedor', 'fecha', 'estado', 'descripcion']


class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['id', 'producto', 'mensaje', 'fecha_creacion', 'leida']

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'message', 'fecha']
        