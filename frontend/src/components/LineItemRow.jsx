import { Trash2 } from 'lucide-react';

/**
 * LineItemRow — single editable row in the invoice builder.
 * Auto-calculates total = qty × unitPrice.
 *
 * @param {{
 *   item: { description: string, quantity: number, unitPrice: number, taxRate: number },
 *   index: number,
 *   onChange: (index: number, field: string, value: any) => void,
 *   onRemove: (index: number) => void,
 * }} props
 */
export default function LineItemRow({ item, index, onChange, onRemove }) {
  const qty   = Number(item.quantity)  || 0;
  const price = Number(item.unitPrice) || 0;
  const total = qty * price;

  return (
    <div
      className="grid grid-cols-12 gap-3 items-center group animate-fade-in"
      id={`line-item-${index}`}
    >
      {/* Description — spans 5 cols */}
      <div className="col-span-12 sm:col-span-5">
        <input
          id={`line-desc-${index}`}
          type="text"
          placeholder="Item description"
          value={item.description}
          onChange={(e) => onChange(index, 'description', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Quantity */}
      <div className="col-span-4 sm:col-span-2">
        <input
          id={`line-qty-${index}`}
          type="number"
          min="0"
          step="1"
          placeholder="Qty"
          value={item.quantity}
          onChange={(e) => onChange(index, 'quantity', e.target.value)}
          className="w-full text-right"
        />
      </div>

      {/* Unit price */}
      <div className="col-span-4 sm:col-span-2">
        <input
          id={`line-price-${index}`}
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={item.unitPrice}
          onChange={(e) => onChange(index, 'unitPrice', e.target.value)}
          className="w-full text-right"
        />
      </div>

      {/* Tax rate */}
      <div className="col-span-3 sm:col-span-1">
        <input
          id={`line-tax-${index}`}
          type="number"
          min="0"
          max="100"
          step="0.5"
          placeholder="%"
          value={item.taxRate}
          onChange={(e) => onChange(index, 'taxRate', e.target.value)}
          className="w-full text-right"
        />
      </div>

      {/* Row total (read-only) + delete */}
      <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-2">
        <span className="text-sm font-semibold text-surface-200 hidden sm:block tabular-nums">
          ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
        <button
          id={`line-remove-${index}`}
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100
                     hover:bg-rose-500/10 text-surface-500 hover:text-rose-400
                     transition-all duration-150 cursor-pointer"
          title="Remove item"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
