import { Entry, Invoice } from "models/Invoice";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Decimal from "decimal.js";
import { User } from "models/User";
import { Auth } from "utils/auth";
import { ApiService } from "services/ApiService";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

declare global {
  interface String {
    replaceCommas(): string;
  }
}

String.prototype.replaceCommas = function (): string {
  return this.replace(",", ".");
};

export const ExcelSheetContent = () => {
  const targetPdfRef = useRef<HTMLDivElement>(null);

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

      if (!parseDecimal(products.quantity) || !parseDecimal(products.vat)) {
        return;
      }

      const productsVatTotal = new Decimal(products.quantity).times(
        products.vat
      );
      const productsTotal = new Decimal(products.quantity).plus(
        productsVatTotal.toDecimalPlaces(4)
      );

      const invoiceQuantityTotal = new Decimal(services.quantity).plus(
        new Decimal(products.quantity)
      );
      const invoiceVatTotal = servicesVatTotal.plus(productsVatTotal);

      const invoiceTotal = servicesTotal.plus(productsTotal);

      setServices((prevServices) => ({
        ...prevServices,
        vatTotal: servicesVatTotal,
        total: servicesTotal,
      }));

      setProducts((prevProducts) => ({
        ...prevProducts,
        vatTotal: productsVatTotal,
        total: productsTotal,
      }));

      setInvoice((prevInvoice) => ({
        ...prevInvoice,
        quantityTotal: invoiceQuantityTotal,
        total: invoiceTotal,
        vatTotal: invoiceVatTotal,
        products: products,
        services: services,
      }));
    };

    calculateTotals();
  }, [services.quantity, services.vat, products.quantity, products.vat]);

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

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Auth.getToken();
    if (token) {
      setUser(token);
    }
  }, []);

  const apiService = new ApiService(user!);

  const handleGenerateODF = async () => {
    if (targetPdfRef.current) {
      targetPdfRef.current.id = "print-pdf";

      const scale = 2;
      const canvas = await html2canvas(targetPdfRef.current, { scale });
      const imgData = canvas.toDataURL("image/png");

      // DOWNLOAD IMAGE
      const downloadLink = document.createElement("a");
      downloadLink.href = imgData;
      downloadLink.download = "myimage.png";
      // downloadLink.click();
      // return;
      //

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight()
      );
      pdf.save("mypdf.pdf");

      // const doc = new jsPDF({
      //   orientation: "landscape",
      //   format: "a4",
      //   unit: "mm",
      //   putOnlyUsedFonts: true,
      // });

      // const contentToPrint = document.querySelector("#print-pdf");
      // if (contentToPrint instanceof HTMLElement) {
      //   doc.html(contentToPrint, {
      //     callback: function (pdf) {
      //       const pageCount = doc.getNumberOfPages();
      //       //pdf.deletePage(pageCount);
      //       pdf.save("mypdf.pdf");
      //     },
      //   });
    }

    return;
    await apiService.generateOdfPage(invoice);
  };

  return (
    <div
      ref={targetPdfRef}
      className="bg-white p-16 lg:w-1/2 md:w-2/3 flex flex-col justify-center items-center rounded-md shadow-md">
      <div className="container mx-auto py-4">
        <div className="w-full py-4">
          <div className="flex flex-col gap-4">
            <div className="flex">
              <div className="flex-1 text-xl font-bold">Resumen mensual</div>
              <div className="flex-1 mx-4">
                <select
                  className="w-full bg-gray-200 p-2 rounded"
                  value={invoice.month}>
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
                  value={invoice.year}>
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
              <div className="flex-1 mx-4">
                {services.vatTotal.toFixed(2)} €
              </div>
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
              <div className="flex-1 mx-4">
                {products.vatTotal.toFixed(2)} €
              </div>
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
      </div>
      <button
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        onClick={handleGenerateODF}>
        Generar Informe
      </button>
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
