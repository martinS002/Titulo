import React, { useState } from 'react';

export default function ShippingForm({ onSubmit, totalAmount, shippingCost, onCancel, selectedComuna }) {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    streetName: '',
    streetNumber: '',
    supplement: '',
    observation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const shippingData = {
      header: {
        certificateNumber: 0,
        customerCardNumber: "18578680",
        countyOfOriginCoverageCode: "STGO",
        labelType: 2,
        marketplaceRut: "96756430",
        sellerRut: "DEFAULT"
      },
      details: [{
        addresses: [
          {
            addressId: 1,
            countyCoverageCode: selectedComuna,
            streetName: formData.streetName,
            streetNumber: formData.streetNumber,
            supplement: formData.supplement || "",
            addressType: "DEST",
            deliveryOnCommercialOffice: false,
            observation: formData.observation || "DEFAULT"
          },
          {
            addressId: 2,
            countyCoverageCode: "STGO",
            streetName: "AVENIDA BARROS ARANA",
            streetNumber: "421",
            supplement: "DEFAULT",
            addressType: "ORIG",
            deliveryOnCommercialOffice: false,
            observation: "DEFAULT"
          }
        ],
        contacts: [
          {
            name: formData.name,
            phoneNumber: formData.phoneNumber.replace(/\s+/g, ''),
            email: formData.email,
            contactType: "R"
          },
          {
            name: "Tienda Ejemplo",
            phoneNumber: "975822046",
            email: "martin.soto.salinas@gmail.com",
            contactType: "S"
          }
        ],
        packages: [{
          weight: "1",
          height: "10",
          width: "10",
          length: "10",
          serviceDeliveryCode: "3",
          productCode: "3",
          deliveryReference: `REF-${Date.now()}`,
          groupReference: "GRUPO",
          declaredValue: Math.round(totalAmount),
          declaredContent: "1",
          receiveableAmountInDelivery: 0
        }]
      }]
    };

    onSubmit(shippingData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Información de Envío</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre completo</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Calle</label>
              <input
                type="text"
                name="streetName"
                value={formData.streetName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Número</label>
              <input
                type="text"
                name="streetNumber"
                value={formData.streetNumber}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Información adicional</label>
              <input
                type="text"
                name="supplement"
                value={formData.supplement}
                onChange={handleChange}
                placeholder="Depto, oficina, etc."
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Observaciones</label>
            <textarea
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="2"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between mb-2">
              <span>Costo de envío:</span>
              <span>${shippingCost}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total a pagar:</span>
              <span>${totalAmount}</span>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Confirmar y Pagar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

