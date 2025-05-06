import { forwardRef } from 'react';
import { theme } from '../../theme';

export const PrintableReceipt = forwardRef(({
  order,
  businessInfo = {
    name: 'Ring & Wing',
    address: 'Your Address Here',
    phone: 'Your Phone Here',
    email: 'your.email@example.com',
    taxId: 'Your Tax ID'
  },
  className = ''
}, ref) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div 
      ref={ref}
      className={`
        max-w-md mx-auto bg-white p-6 
        print:p-2 print:max-w-full ${className}
      `}
    >
      {/* Business Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-1">{businessInfo.name}</h1>
        <div className="text-sm space-y-1">
          <p>{businessInfo.address}</p>
          <p>{businessInfo.phone}</p>
          <p>{businessInfo.email}</p>
          <p>Tax ID: {businessInfo.taxId}</p>
        </div>
      </div>

      {/* Order Details */}
      <div className="border-t border-b py-4 mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Receipt #:</strong> {order.receiptNumber}
          </div>
          <div>
            <strong>Date:</strong> {formatDate(order.createdAt)}
          </div>
          <div>
            <strong>Server:</strong> {order.server}
          </div>
          <div>
            <strong>Type:</strong> {order.orderType}
          </div>
          {order.table && (
            <div>
              <strong>Table:</strong> {order.table}
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <>
                <tr key={index} className="border-b last:border-b-0">
                  <td className="py-2">
                    <div>{item.name}</div>
                    {item.selectedSize && (
                      <div className="text-xs text-gray-600">
                        Size: {item.selectedSize}
                      </div>
                    )}
                  </td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
                {item.addOns?.map((addOn, addOnIndex) => (
                  <tr key={`${index}-${addOnIndex}`} className="text-xs">
                    <td className="py-1 pl-4">
                      + {addOn.name}
                    </td>
                    <td className="py-1 text-center">{addOn.quantity}</td>
                    <td className="py-1 text-right">
                      {formatCurrency(addOn.price)}
                    </td>
                    <td className="py-1 text-right">
                      {formatCurrency(addOn.price * addOn.quantity)}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{formatCurrency(order.totals.subtotal)}</span>
        </div>
        {order.totals.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span>Tax ({order.totals.taxRate}%):</span>
            <span>{formatCurrency(order.totals.tax)}</span>
          </div>
        )}
        {order.totals.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span>Discount:</span>
            <span>-{formatCurrency(order.totals.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>{formatCurrency(order.totals.total)}</span>
        </div>
        
        {/* Payment Details */}
        <div className="border-t pt-2 mt-4 text-sm">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span>{order.paymentMethod}</span>
          </div>
          {order.paymentDetails?.change && (
            <>
              <div className="flex justify-between">
                <span>Amount Tendered:</span>
                <span>{formatCurrency(order.paymentDetails.tendered)}</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span>{formatCurrency(order.paymentDetails.change)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-sm">
        <p className="font-medium mb-2">Thank you for dining with us!</p>
        <p className="text-xs">
          This serves as your official receipt.
          Please keep this for your records.
        </p>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            margin: 0.5cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
});