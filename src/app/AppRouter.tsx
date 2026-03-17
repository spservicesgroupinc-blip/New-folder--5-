import React from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import type { ViewType } from './routes';

// ---------------------------------------------------------------------------
// Placeholder for views that have not been built yet.
// ---------------------------------------------------------------------------
const PlaceholderView: React.FC<{ name: string }> = ({ name }) => (
  <div className="p-8 text-slate-400">View: {name} (coming soon)</div>
);

// ---------------------------------------------------------------------------
// Lazily-loaded views that already exist on disk.
// ---------------------------------------------------------------------------
// NOTE: Add React.lazy() entries here as feature components are created.
// Example (uncomment when the file exists):
//   const CalculatorShell = React.lazy(
//     () => import('../features/calculator/components/CalculatorShell'),
//   );

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export const AppRouter: React.FC = () => {
  const { state } = useCalculator();
  const view = state.ui.view as ViewType;

  switch (view) {
    // -- Views to be lazily loaded once components exist --
    case 'calculator':
      return <PlaceholderView name="calculator" />;

    case 'dashboard':
      return <PlaceholderView name="dashboard" />;

    case 'estimate_stage':
      return <PlaceholderView name="estimate_stage" />;

    case 'work_order_stage':
      return <PlaceholderView name="work_order_stage" />;

    case 'invoice_stage':
      return <PlaceholderView name="invoice_stage" />;

    case 'warehouse':
      return <PlaceholderView name="warehouse" />;

    case 'customers':
      return <PlaceholderView name="customers" />;

    case 'customer_detail':
      return <PlaceholderView name="customer_detail" />;

    case 'material_order':
      return <PlaceholderView name="material_order" />;

    case 'material_report':
      return <PlaceholderView name="material_report" />;

    case 'equipment_tracker':
      return <PlaceholderView name="equipment_tracker" />;

    case 'settings':
      return <PlaceholderView name="settings" />;

    case 'profile':
      return <PlaceholderView name="profile" />;

    // estimate_detail is defined in routes.ts but not in the ViewType union
    // inside CalculatorContext — handle it defensively.
    case 'estimate_detail' as ViewType:
      return <PlaceholderView name="estimate_detail" />;

    default: {
      // Exhaustive fallback: render a generic placeholder so the app never
      // crashes on an unrecognised view string.
      const unknownView: string = view;
      return <PlaceholderView name={unknownView} />;
    }
  }
};
