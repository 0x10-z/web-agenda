import { Entry, Invoice } from "models/Invoice";
import { ChangeEvent, useEffect, useState } from "react";
import Decimal from "decimal.js";

declare global {
  interface String {
    replaceCommas(): string;
  }
}

String.prototype.replaceCommas = function (): string {
  return this.replace(",", ".");
};

export const ExcelSheetContent = () => {
  const [services, setServices] = useState<Entry>({
    name: "Servicios",
    quantity: "",
    vat: "0.21",
    vatTotal: new Decimal(0),
    total: new Decimal(0),
  });
  const [products, setProducts] = useState<Entry>({
    name: "Productos",
    quantity: "",
    vat: "0.21",
    vatTotal: new Decimal(0),
    total: new Decimal(0),
  });

  const [invoice, setInvoice] = useState<Invoice>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    quantityTotal: new Decimal(0),
    vat: "0.21",
    vatTotal: new Decimal(0),
    services: services,
    products: products,
    total: new Decimal(0),
  });

  useEffect(() => {
    const calculateTotals = () => {
      // if comma, replace by dot
      services.quantity = services.quantity.replaceCommas();
      services.vat = services.vat.replaceCommas();
      products.quantity = products.quantity.replaceCommas();
      products.vat = products.vat.replaceCommas();
      if (
        hasDotAtStartOrEnd(services.quantity) ||
        !parseDecimal(services.quantity) ||
        hasDotAtStartOrEnd(services.vat) ||
        !parseDecimal(services.vat)
      ) {
        return;
      }

      const servicesVatTotal = new Decimal(services.quantity).times(
        services.vat
      );
      const servicesTotal = new Decimal(services.quantity).plus(
        servicesVatTotal.toDecimalPlaces(4)
      );
      setServices((prevServices) => ({
        ...prevServices,
        vatTotal: servicesVatTotal,
        total: servicesTotal,
      }));

      if (!parseDecimal(products.quantity) || !parseDecimal(products.vat)) {
        return;
      }

      const productsVatTotal = new Decimal(products.quantity).times(
        products.vat
      );
      const productsTotal = new Decimal(products.quantity).plus(
        productsVatTotal.toDecimalPlaces(4)
      );
      setProducts((prevProducts) => ({
        ...prevProducts,
        vatTotal: productsVatTotal,
        total: productsTotal,
      }));

      const invoiceQuantityTotal = new Decimal(services.quantity).plus(
        new Decimal(products.quantity)
      );
      const invoiceVatTotal = services.vatTotal.plus(products.vatTotal);

      const invoiceTotal = services.total.plus(products.total);
      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        quantityTotal: invoiceQuantityTotal,
        total: invoiceTotal,
        vatTotal: invoiceVatTotal,
      }));
    };

    calculateTotals();
  }, [
    services.quantity,
    services.vatTotal,
    services.vat,
    products.quantity,
    products.vatTotal,
    products.vat,
  ]);

  const handleChange = (field: string, e: ChangeEvent<HTMLInputElement>) => {
    //const newValue = parseDecimal(e.target.value);
    const newValue = e.target.value;

    if (field === "servicesQuantity") {
      setServices((prevServices) => ({
        ...prevServices,
        quantity: newValue ? newValue.toString() : "",
      }));
    } else if (field === "servicesVat") {
      setServices((prevServices) => ({
        ...prevServices,
        vat: newValue ? newValue.toString() : "",
      }));
    } else if (field === "productsQuantity") {
      setProducts((prevServices) => ({
        ...prevServices,
        quantity: newValue ? newValue.toString() : "",
      }));
    } else if (field === "productsVat") {
      setProducts((prevServices) => ({
        ...prevServices,
        vat: newValue ? newValue.toString() : "",
      }));
    }
  };
  return (
    <div className="w-full py-4">
      <div className="flex flex-col gap-4">
        <div className="flex">
          <div className="flex-1 text-xl font-bold">Resumen mensual</div>
          <div className="flex-1 mx-4">
            <select
              className="w-full bg-gray-200 p-2 rounded"
              value={invoice.month}
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index} value={index + 1}>
                  {getMonthName(index + 1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 mx-4">
            <select
              className="w-full bg-gray-200 p-2 rounded"
              value={invoice.year}
            >
              {Array.from({ length: 11 }, (_, index) => (
                <option key={index} value={invoice.year + index - 5}>
                  {invoice.year + index - 5}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex">
          <div className="font-bold flex-1 mx-4"></div>
          <div className="flex-1 mx-4 text-lg font-bold">Neto</div>
          <div className="flex-1 mx-4 text-lg font-bold">%</div>
          <div className="flex-1 mx-4 text-lg font-bold">IVA</div>
          <div className="flex-1 mx-4 text-lg font-bold">Total</div>
        </div>
        <div className="flex">
          <div className="font-bold flex-1 mx-4">{services.name}</div>
          <div className="flex-1 mx-4">
            <input
              type="text"
              className="w-full bg-gray-200 p-2 rounded"
              value={services.quantity}
              onChange={(e) => handleChange("servicesQuantity", e)}
            />
          </div>
          <div className="flex-1 mx-4">
            <input
              type="text"
              className="w-full bg-gray-200 p-2 rounded"
              value={services.vat}
              onChange={(e) => handleChange("servicesVat", e)}
            />
          </div>
          <div className="flex-1 mx-4">{services.vatTotal.toFixed(2)} €</div>
          <div className="flex-1 mx-4">{services.total.toFixed(2)} €</div>
        </div>
        <div className="flex">
          <div className="font-bold flex-1 mx-4">{products.name}</div>
          <div className="flex-1 mx-4">
            <input
              type="text"
              className="w-full bg-gray-200 p-2 rounded"
              value={products.quantity}
              onChange={(e) => handleChange("productsQuantity", e)}
            />
          </div>
          <div className="flex-1 mx-4">
            <input
              type="text"
              className="w-full bg-gray-200 p-2 rounded"
              value={products.vat}
              onChange={(e) => handleChange("productsVat", e)}
            />
          </div>
          <div className="flex-1 mx-4">{products.vatTotal.toFixed(2)} €</div>
          <div className="flex-1 mx-4">{products.total.toFixed(2)} €</div>
        </div>

        <div className="flex ">
          <div className="font-bold flex-1 mx-4">Total</div>
          <div className="flex-1 mx-4">
            {invoice.quantityTotal.toFixed(2)} €
          </div>
          <div className="w-40">{/* cálculo */}</div>
          <div className="flex-1 mx-4">
            {invoice.vatTotal.toDecimalPlaces(2).toString()} €
          </div>
          <div className="flex-1 mx-4">{invoice.total.toFixed(2)} €</div>
        </div>
      </div>
    </div>
  );
};

function parseDecimal(str: string) {
  try {
    const formattedStr = str.replace(",", ".").replace("-", ".");
    const decimalValue = new Decimal(formattedStr);
    return decimalValue;
  } catch (error) {
    return false;
  }
}

function hasDotAtStartOrEnd(text: string): boolean {
  const regex = /^\./.test(text) || /\.$/.test(text);
  return regex;
}

function getMonthName(month: number) {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return months[month - 1];
}
