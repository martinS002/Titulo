from rest_framework import viewsets
import json
from .models import Inventario, Notificacion
from .serializers import InventarioSerializer, ProveedorSerializer, NotificacionSerializer
from supabase import create_client, Client
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from inventario import settings

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer
    lookup_field = 'codigo_producto'

url: str = "https://yedojhnqvbcgkmkwibcr.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllZG9qaG5xdmJjZ2tta3dpYmNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTEwMzUwMiwiZXhwIjoyMDQ0Njc5NTAyfQ.rrq2_8PqTdyU1PI5frxmc8lK3cvj-8YQ5RkX9fDivWM"
supabase: Client = create_client(url, key)

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({"error": "Email y contraseña son requeridos"}, status=400)
        
        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        return JsonResponse({"message": "Usuario registrado exitosamente"}, status=201)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return JsonResponse({"error": "Email y contraseña son requeridos"}, status=400)
        
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return JsonResponse({"token": response.session.access_token}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
from django.shortcuts import render
from .models import Ventas, Producto
from .serializers import VentasSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rest_framework.decorators import api_view


@api_view(['GET'])
def detalle_venta(request, venta_id):
    try:
        venta = Ventas.objects.get(id=venta_id)
    except Ventas.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = VentasSerializer(venta)
    return Response(serializer.data)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.error.transbank_error import TransbankError
import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from transbank.error.transbank_error import TransbankError
from transbank.webpay.webpay_plus.transaction import Transaction, WebpayOptions
import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from transbank.error.transbank_error import TransbankError
from transbank.webpay.webpay_plus.transaction import Transaction, WebpayOptions
import json

@csrf_exempt
@require_http_methods(["POST"])
def init_transaction(request):
    print("Recibiendo solicitud de transacción")
    try:
        data = json.loads(request.body)
        print(f"Datos crudos recibidos: {request.body}")

        amount = data.get('amount')
        session_id = data.get('session_id')
        buy_order = data.get('buy_order')
        
        print(f"Datos recibidos: amount={amount}, session_id={session_id}, buy_order={buy_order}")
        
        if not all([amount, session_id, buy_order]):
            return JsonResponse({'error': 'Faltan datos requeridos'}, status=400)

        # Asegúrate de que esta URL coincida exactamente con la ruta en tu aplicación Next.js
        return_url = "http://localhost:3000/transbank-result"
        
        tx = Transaction(WebpayOptions(
            integration_type="TEST",
            commerce_code="597055555532",
            api_key="579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"
        ))
        
        response = tx.create(buy_order, session_id, amount, return_url)
        print(f"Respuesta de Transbank: {response}")
        
        return JsonResponse({
            "url": response['url'],
            "token": response['token']
        })
    except TransbankError as e:
        print(f"Error de Transbank: {str(e)}")
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        print(f"Error inesperado: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)






from django.core.cache import cache

@csrf_exempt
@require_http_methods(["POST"])
def confirm_transaction(request):
    logger.info("Iniciando confirmación de transacción")
    try:
        data = json.loads(request.body)
        token = data.get('token_ws')
        
        logger.info(f"Token recibido: {token}")
        
        if not token:
            logger.error("Token no proporcionado")
            return JsonResponse({"error": "Token no proporcionado"}, status=400)

        # Usar el token como clave para el bloqueo
        lock_key = f"transaction_lock_{token}"
        
        # Intentar adquirir el bloqueo
        if not cache.add(lock_key, "locked", timeout=30):  # 30 segundos de timeout
            logger.warning(f"Transacción {token} ya está siendo procesada")
            # Esperar un momento y verificar el estado
            import time
            time.sleep(5)  # Esperar 5 segundos

        tx = Transaction(WebpayOptions(
            integration_type="TEST",
            commerce_code="597055555532",
            api_key="579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"
        ))
        
        # Verificar el estado de la transacción
        try:
            logger.info(f"Verificando estado de la transacción {token}")
            status = tx.status(token)
            logger.info(f"Estado de la transacción: {status}")
            
            if status.get('status') == 'AUTHORIZED':
                logger.info(f"Transacción {token} ya está autorizada")
                cache.delete(lock_key)  # Liberar el bloqueo
                return JsonResponse({
                    "status": "AUTHORIZED",
                    "amount": status.get('amount'),
                    "buy_order": status.get('buy_order'),
                    "card_detail": status.get('card_detail', {})
                })
        except Exception as e:
            logger.warning(f"No se pudo obtener el estado de la transacción {token}: {str(e)}")
        
        # Si no está autorizada, intentar confirmarla
        try:
            logger.info(f"Intentando confirmar la transacción {token}")
            response = tx.commit(token)
            
            logger.info(f"Respuesta de confirmación para {token}: {response}")
            
            # Convertir la respuesta a diccionario si no lo es ya
            if not isinstance(response, dict):
                response = response.__dict__

            cache.delete(lock_key)  # Liberar el bloqueo
            return JsonResponse({
                "status": "AUTHORIZED",
                "amount": response.get('amount'),
                "buy_order": response.get('buy_order'),
                "card_detail": response.get('card_detail', {})
            })
            
        except TransbankError as tbk_error:
            logger.error(f"Error de Transbank para {token}: {str(tbk_error)}")
            if 'Transaction already locked' in str(tbk_error):
                # Si la transacción está bloqueada, intentamos obtener su estado nuevamente
                try:
                    status = tx.status(token)
                    if status.get('status') == 'AUTHORIZED':
                        cache.delete(lock_key)  # Liberar el bloqueo
                        return JsonResponse({
                            "status": "AUTHORIZED",
                            "amount": status.get('amount'),
                            "buy_order": status.get('buy_order'),
                            "card_detail": status.get('card_detail', {})
                        })
                except Exception as e:
                    logger.error(f"Error al obtener estado después de 'Transaction already locked' para {token}: {str(e)}")
            
            cache.delete(lock_key)  # Liberar el bloqueo en caso de error
            return JsonResponse({
                "error": str(tbk_error),
                "status": "ERROR"
            }, status=400)
            
    except json.JSONDecodeError:
        logger.error("JSON inválido recibido")
        return JsonResponse({"error": "JSON inválido"}, status=400)
    except Exception as e:
        logger.exception(f"Error inesperado: {str(e)}")
        if 'lock_key' in locals():
            cache.delete(lock_key)  # Asegurarse de liberar el bloqueo en caso de error
        return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from django.db.models import Sum

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db import transaction
from .models import Pedido, Transaccion, OrdenEnvio, ItemPedido, DetalleVenta
import json

# views.py
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db import transaction
from .models import Pedido, Transaccion, OrdenEnvio, ItemPedido
import json

logger = logging.getLogger(__name__)

# views.py
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db import transaction
from .models import Pedido, Transaccion, OrdenEnvio, ItemPedido
import json

logger = logging.getLogger(__name__)

import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db import transaction
from .models import Pedido, Transaccion, OrdenEnvio, ItemPedido
import json

logger = logging.getLogger(__name__)

import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.db import transaction
from .models import Pedido, Transaccion, OrdenEnvio, ItemPedido
import json

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def actualizar_pedido(request):
    logger.info("Iniciando actualizar_pedido")
    
    try:
        with transaction.atomic():
            data = json.loads(request.body)
            logger.info("Datos recibidos: %s", data)

            # Obtener datos del carrito
            pending_cart_data = json.loads(data.get('pendingCartData', '{}'))
            cart_items = pending_cart_data.get('cart', [])
            total_amount = float(pending_cart_data.get('totalAmount'))
            shipping_cost = float(pending_cart_data.get('shippingCost'))
            
            # Calcular el total final incluyendo el costo de envío
            total_final = total_amount + shipping_cost
            
            logger.info(f"Total amount: {total_amount}")
            logger.info(f"Shipping cost: {shipping_cost}")
            logger.info(f"Total final: {total_final}")
            
            # Obtener datos de envío
            shipping_data = json.loads(data.get('pendingShippingData', '{}'))
            
            # Extraer detalles de la transacción
            detalles_transaccion = data.get('transactionDetails', {})
            
            # Obtener número de pedido
            numero_pedido = detalles_transaccion.get('buy_order')
            if not numero_pedido:
                logger.error("Número de pedido no proporcionado")
                raise ValueError('Número de pedido no proporcionado')
            
            logger.info(f"Procesando pedido: {numero_pedido}")

            # Verificar si el pedido ya existe
            existing_pedido = Pedido.objects.filter(numero_pedido=numero_pedido).first()
            if existing_pedido:
                logger.warning(f"Pedido ya existe: {numero_pedido}")
                return JsonResponse({
                    'status': 'error',
                    'message': 'El pedido ya existe'
                }, status=400)

            # Crear el pedido con el total final
            pedido = Pedido.objects.create(
                numero_pedido=numero_pedido,
                total=total_final,
                estado='completado'
            )
            logger.info(f"Pedido creado: {pedido.numero_pedido} con total: {pedido.total}")

            # Crear los items del pedido y actualizar el inventario
            items_pedido = []
            for item in cart_items:
                if isinstance(item, dict):
                    precio = float(item.get('precio_venta'))
                    cantidad = int(item.get('quantity', 1))
                    subtotal = precio * cantidad
                    
                    # Actualizar el inventario
                    try:
                        producto = Inventario.objects.select_for_update().get(id=item.get('id'))
                        if producto.stock >= cantidad:
                            producto.stock -= cantidad
                            producto.save()
                            logger.info(f"Stock actualizado para el producto {item.get('id')}: nuevo stock {producto.stock}")
                        else:
                            logger.error(f"Stock insuficiente para el producto {item.get('id')}")
                            raise ValueError(f"Stock insuficiente para el producto {item.get('id')}")
                    except Inventario.DoesNotExist:
                        logger.error(f"Producto {item.get('id')} no encontrado en el inventario")
                        raise ValueError(f"Producto {item.get('id')} no encontrado en el inventario")
                    
                    items_pedido.append(
                        ItemPedido(
                            pedido=pedido,
                            id_producto=item.get('id'),
                            cantidad=cantidad,
                            precio=precio,
                            subtotal=subtotal
                        )
                    )
            
            if items_pedido:
                ItemPedido.objects.bulk_create(items_pedido)
                logger.info(f"Items del pedido creados: {len(items_pedido)} items")

            # Crear la transacción
            transaccion = Transaccion.objects.create(
                pedido=pedido,
                id_transaccion=detalles_transaccion.get('transaction_id', str(numero_pedido)),
                monto=total_final,
                estado='AUTHORIZED'
            )
            logger.info(f"Transacción creada: {transaccion.id_transaccion} con monto: {transaccion.monto}")

            # Crear la orden de envío
            if data.get('shippingOrder') and data.get('shippingReference'):
                orden_envio = OrdenEnvio.objects.create(
                    pedido=pedido,
                    numero_orden_envio=str(data.get('shippingOrder')),
                    referencia_envio=str(data.get('shippingReference')),
                    costo_envio=shipping_cost
                )
                logger.info(f"Orden de envío creada: {orden_envio.numero_orden_envio} con costo: {orden_envio.costo_envio}")

            return JsonResponse({
                'status': 'success',
                'orderNumber': pedido.numero_pedido,
                'total': str(pedido.total)
            })

    except json.JSONDecodeError as e:
        logger.error(f"Error al decodificar JSON: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Error al decodificar JSON: {str(e)}'
        }, status=400)
    except ValueError as e:
        logger.error(f"Error de validación: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)
    except Exception as e:
        logger.exception(f"Error inesperado: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': f'Error inesperado: {str(e)}'
        }, status=500)

@api_view(['GET'])
def productos_mas_vendidos(request):
    categoria = request.GET.get('categoria', None)
    fecha = request.GET.get('fecha', None)
    
    query = DetalleVenta.objects.values(
        'producto__nombre', 
        'producto__id',
        'producto__categoria'
    )
    
    if categoria:
        query = query.filter(producto__categoria=categoria)
    
    if fecha:
        query = query.filter(venta__fecha_venta__date=fecha)
    
    top_productos = query.annotate(
        total_vendido=Sum('cantidad')
    ).order_by('-total_vendido')
    
    return Response(top_productos)

@api_view(['GET'])
def categorias_productos(request):
    fecha = request.GET.get('fecha', None)
    
    query = Inventario.objects
    if fecha:
        query = query.filter(
            id__in=DetalleVenta.objects.filter(
                venta__fecha_venta__date=fecha
            ).values('producto_id')
        )
    
    categorias = query.values_list('categoria', flat=True).distinct()
    return Response(list(categorias))


from rest_framework import viewsets
from .models import Envio , Proveedor
from .serializers import EnvioSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.all()
    serializer_class = ProveedorSerializer

class EnvioViewSet(viewsets.ModelViewSet):
    queryset = Envio.objects.all()
    serializer_class = EnvioSerializer

    def get_queryset(self):
        queryset = Envio.objects.all()
        proveedor_id = self.request.query_params.get('proveedor', None)
        if proveedor_id is not None:
            queryset = queryset.filter(proveedor_id=proveedor_id)
        return queryset

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificacion.objects.all()
    serializer_class = NotificacionSerializer


    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator

@api_view(['GET'])
def listar_pedidos(request):
    try:
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 10))
        
        # Obtener todos los pedidos ordenados por fecha de creación
        pedidos = Pedido.objects.all().order_by('-creado_en')
        
        # Crear el paginador
        paginator = Paginator(pedidos, limit)
        pedidos_page = paginator.get_page(page)
        
        # Preparar los datos
        results = [{
            'numero_pedido': pedido.numero_pedido,
            'estado': pedido.estado,
            'total': str(pedido.total),
            'creado_en': pedido.creado_en
        } for pedido in pedidos_page]
        
        # Construir la respuesta
        response_data = {
            'results': results,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'total_items': paginator.count
        }
        
        return Response(response_data)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['GET'])
def obtener_detalles_envio(request, numero_pedido):
    try:
        # Obtener el pedido con sus items y orden de envío usando solo prefetch_related
        pedido = Pedido.objects.prefetch_related(
            'ordenenvio_set',
            'itempedido_set'
        ).get(numero_pedido=numero_pedido)
        
        # Obtener los items del pedido
        items = [{
            'id_producto': item.id_producto,
            'cantidad': item.cantidad,
            'precio': str(item.precio),
            'subtotal': str(item.subtotal)
        } for item in pedido.itempedido_set.all()]
        
        # Obtener la orden de envío
        try:
            orden_envio = pedido.ordenenvio_set.first()
            envio_data = {
                'numero_orden': orden_envio.numero_orden_envio,
                'referencia': orden_envio.referencia_envio,
                'costo': str(orden_envio.costo_envio)
            } if orden_envio else None
        except Exception as e:
            envio_data = None
        
        # Construir la respuesta
        response_data = {
            'numero_pedido': pedido.numero_pedido,
            'estado': pedido.estado,
            'total': str(pedido.total),
            'creado_en': pedido.creado_en,
            'items': items,
            'envio': envio_data
        }
        
        return Response(response_data)
        
    except Pedido.DoesNotExist:
        return Response(
            {'error': 'Pedido no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error en obtener_detalles_envio: {str(e)}")  # Para debugging
        return Response(
            {'error': 'Error al obtener los detalles del envío'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
from .models import Contact
from .serializers import ContactSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    http_method_names = ['get', 'post'] 