from rest_framework import viewsets,permissions,generics,serializers
from .models import Inventario, Ventas
from .serializers import InventarioSerializer, TaskSerializer, VentasSerializer , ProveedorSerializer
from .models import Task , Proveedor
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView




class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer

    def perform_create(self, serializer):
        if 'id' in serializer.validated_data:
            if Inventario.objects.filter(id=serializer.validated_data['id']).exists():
                raise serializers.ValidationError("El ID ya existe.")
        serializer.save()


    def perform_update(self, serializer):
        imagen = self.request.data.get('imagen')
        if imagen:
            serializer.save(imagen=imagen)
        else:
            serializer.save()


    def done(self, request, pk=None):
        invetario = self.get_object()
        invetario.done = True
        invetario.save()
        return Response(invetario)
    
  
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    permission_classes=[permissions.AllowAny]
    serializer_class = TaskSerializer

    @action(detail=True, methods=['post'])   
    def done(self, request, pk=None):
        task = self.get_object()
        task.done = not task.done
        task.save()
        return Response({'status': 'task done' if task.done else  'task undone'},status=status.HTTP_200_OK)
    


class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

# views.py
from django.utils.timezone import now
from django.http import JsonResponse
from .models import Ventas
from django.db import transaction

def ventas_hoy(request):
    hoy = now().date()
    ventas = Ventas.objects.filter(fecha_venta__date=hoy)
    ventas_data = [
        {
            'id': venta.id,
            'fecha_venta': venta.fecha_venta,
            'productos': venta.productos,
            'metodo_pago': venta.metodo_pago,
            'facturacion': venta.facturacion,
            'total': float(venta.total),
        }
        for venta in ventas
    ]
    return JsonResponse(ventas_data, safe=False)

@api_view(['GET'])
def detalle_venta(request, venta_id):
    try:
        venta = Ventas.objects.get(id=venta_id)
    except Ventas.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = VentasSerializer(venta)
    return Response(serializer.data)


import logging

logger = logging.getLogger(__name__)

class VentasViewSet(viewsets.ModelViewSet):
    queryset = Ventas.objects.all()
    serializer_class = VentasSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Datos recibidos: {request.data}")
            
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                logger.error(f"Errores de validación: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            venta = serializer.save()
            
            logger.info(f"Venta creada exitosamente: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error inesperado: {str(e)}")
            return Response(
                {'error': 'Error al procesar la venta'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        return Ventas.objects.prefetch_related('detalles').all()

