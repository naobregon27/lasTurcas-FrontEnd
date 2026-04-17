import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function BarcodeDisplay({ value, width = 2, height = 60, dark = true, fontSize = 12 }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          lineColor: dark ? '#e2e8f0' : '#1e293b',
          background: 'transparent',
          width,
          height,
          displayValue: true,
          fontSize,
          fontOptions: '',
          font: 'monospace',
          textAlign: 'center',
          textPosition: 'bottom',
          textMargin: 4,
          margin: 8,
        });
      } catch {
        // invalid barcode value
      }
    }
  }, [value, width, height, dark, fontSize]);

  if (!value) return null;

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} />
    </div>
  );
}
