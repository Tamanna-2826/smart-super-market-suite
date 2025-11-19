import DashboardLayout from "@/components/layout/DashboardLayout";

const Inventory = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
        <p className="text-muted-foreground mt-2">Track and manage stock levels</p>
        <div className="mt-8 p-8 border-2 border-dashed border-border rounded-lg text-center">
          <p className="text-muted-foreground">Inventory management features coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
