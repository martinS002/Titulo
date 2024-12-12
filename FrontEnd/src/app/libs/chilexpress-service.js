const API_BASE = 'https://testservices.wschilexpress.com';
const COVERAGE_API_KEY = 'dea94f8a1852436191dbd06070526495';
const QUOTE_API_KEY = 'a5f3e99760d546c9b10a9f5d343192e1';
const TRANSPORT_API_KEY = 'b4cdfb64d17244ce8a34ace2f7b1a17a';

export async function getRegions() {
  try {
    const response = await fetch(`${API_BASE}/georeference/api/v1.0/regions`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': COVERAGE_API_KEY
      }
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const data = await response.json();
    console.log('Regiones:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener regiones:', error);
    throw error;
  }
}

export async function getComunas(regionCode) {
  try {
    const response = await fetch(
      `${API_BASE}/georeference/api/v1.0/coverage-areas?RegionCode=${regionCode}&type=0`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Ocp-Apim-Subscription-Key': COVERAGE_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Comunas:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener comunas:', error);
    throw error;
  }
}

export async function getShippingQuote(originCode, destinationCode, packageDetails) {
  try {
    console.log('Solicitando cotización con:', { originCode, destinationCode, packageDetails });
    
    const requestBody = {
      originCountyCode: originCode,
      destinationCountyCode: destinationCode,
      package: {
        weight: packageDetails.weight.toString(),
        height: "10",
        width: "10",
        length: "10"
      },
      productType: 3,
      contentType: 1,
      declaredWorth: "2333",
      deliveryTime: 0
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE}/rating/api/v1.0/rates/courier`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': QUOTE_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de la API:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Respuesta de cotización:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error al obtener cotización de envío:', error);
    throw error;
  }
}

export async function createTransportOrder(orderData) {
  try {
    // Aseguramos que los datos coincidan con el formato esperado
    const formattedOrderData = {
      header: {
        certificateNumber: 0,
        customerCardNumber: "18578680",
        countyOfOriginCoverageCode: "TILT",
        labelType: 2,
        marketplaceRut: "96756430",
        sellerRut: "DEFAULT"
      },
      details: [{
        addresses: [
          {
            addressId: 0,
            countyCoverageCode: orderData.details[0].addresses[0].countyCoverageCode,
            streetName: orderData.details[0].addresses[0].streetName,
            streetNumber: orderData.details[0].addresses[0].streetNumber,
            supplement: orderData.details[0].addresses[0].supplement || "",
            addressType: "DEST",
            deliveryOnCommercialOffice: false,
            observation: orderData.details[0].addresses[0].observation || "DEFAULT"
          },
          {
            addressId: 0,
            countyCoverageCode: "TILT",
            streetName: "AVENIDA BARROS ARANA",
            streetNumber: "302",
            supplement: "DEFAULT",
            addressType: "DEV",
            deliveryOnCommercialOffice: false,
            observation: "DEFAULT"
          }
        ],
        // Modificamos la estructura de contacts para tener exactamente un remitente y un destinatario
        contacts: [
          {
            name: orderData.details[0].contacts[0].name,
            phoneNumber: orderData.details[0].contacts[0].phoneNumber,
            mail: orderData.details[0].contacts[0].email, // Cambiado de email a mail según documentación
            contactType: "R"  // Remitente
          },
          {
            name: "Martin Soto", // Contacto fijo para devolución
            phoneNumber: "97822046",
            mail: "martin.soto.salinas@gmail.com",
            contactType: "D"  // Destinatario
          }
        ],
        packages: orderData.details[0].packages.map(pkg => ({
          weight: pkg.weight.toString(),
          height: pkg.height.toString(),
          width: pkg.width.toString(),
          length: pkg.length.toString(),
          serviceDeliveryCode: pkg.serviceDeliveryCode,
          productCode: pkg.productCode,
          deliveryReference: pkg.deliveryReference,
          groupReference: "GRUPO",
          declaredValue: pkg.declaredValue.toString(),
          declaredContent: pkg.declaredContent.toString(),
          receivableAmountInDelivery: pkg.receiveableAmountInDelivery || 0
        }))
      }]
    };

    console.log('Enviando orden de transporte:', JSON.stringify(formattedOrderData, null, 2));
    
    const response = await fetch(`${API_BASE}/transport-orders/api/v1.0/transport-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': TRANSPORT_API_KEY
      },
      body: JSON.stringify(formattedOrderData)
    });

    const responseText = await response.text();
    console.log('Respuesta del servidor:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Error al parsear la respuesta JSON:', e);
      throw new Error('Respuesta inválida del servidor');
    }

    if (data.statusCode === 99 || (data.data?.detail && data.data.detail[0]?.statusCode < 0)) {
      const errorMessage = data.data?.detail?.[0]?.statusDescription || data.statusDescription;
      throw new Error(errorMessage);
    }

    return {
      orderNumber: data.data?.detail?.[0]?.transportOrderNumber,
      reference: data.data?.detail?.[0]?.reference
    };
  } catch (error) {
    console.error('Error detallado al crear orden de transporte:', error);
    throw error;
  }
}




