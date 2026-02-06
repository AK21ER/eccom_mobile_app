import { orderApi } from "../lib/api";
import { formatDate, getOrderStatusBadge } from "../lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
}

interface Order {
  _id: string;
  user: string;
  clerkId: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  status: "pending" | "shipped" | "delivered";
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  orders: Order[];
  pagination?: any;
}

function OrdersPage() {
  const queryClient = useQueryClient();

  const {
    data: ordersData,
    isLoading,
    isError,
    error
  } = useQuery<OrdersResponse>({
    queryKey: ["orders"],
    queryFn: orderApi.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: orderApi.updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const orders = ordersData?.orders || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error shadow-lg">
        <XIcon className="w-6 h-6" />
        <span>Error loading orders: {(error as any)?.message || "Unknown error"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-base-content/70">Review and manage customer orders.</p>
      </div>

      {/* ORDERS TABLE */}
      <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
        <div className="card-body p-0">
          {orders.length === 0 ? (
            <div className="text-center py-16 px-4 bg-base-200/30">
              <div className="max-w-md mx-auto">
                <p className="text-2xl font-bold mb-2">No orders found</p>
                <p className="text-base-content/60">
                  When customers place orders, they will appear here for processing.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-base-200/50">
                  <tr>
                    <th className="font-bold">Order ID</th>
                    <th className="font-bold">Customer</th>
                    <th className="font-bold">Summary</th>
                    <th className="font-bold text-right">Total</th>
                    <th className="font-bold">Status</th>
                    <th className="font-bold text-right">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-base-200">
                  {orders.map((order) => {
                    const totalQuantity = order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );
                    const badgeClass = getOrderStatusBadge(order.status);

                    return (
                      <tr key={order._id} className="hover:bg-base-200/20 transition-colors">
                        <td className="font-mono text-xs opacity-70">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>

                        <td>
                          <div className="font-bold text-sm">{order.shippingAddress.fullName}</div>
                          <div className="text-xs opacity-60 truncate max-w-40">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </div>
                        </td>

                        <td>
                          <div className="font-medium text-sm">{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}</div>
                          <div className="text-xs opacity-60 truncate max-w-52">
                            {order.orderItems[0]?.name}
                            {order.orderItems.length > 1 && ` +${order.orderItems.length - 1} more`}
                          </div>
                        </td>

                        <td className="text-right">
                          <span className="font-bold text-base text-primary">
                            ${order.totalPrice.toFixed(2)}
                          </span>
                        </td>

                        <td>
                          <div className="flex items-center gap-3">
                            <span className={`badge badge-sm ${badgeClass} font-semibold uppercase tracking-wider`}>
                              {order.status}
                            </span>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              className="select select-bordered select-xs w-28 bg-transparent"
                              disabled={updateStatusMutation.isPending}
                            >
                              <option value="pending">Set Pending</option>
                              <option value="shipped">Set Shipped</option>
                              <option value="delivered">Set Delivered</option>
                            </select>
                          </div>
                        </td>

                        <td className="text-right whitespace-nowrap">
                          <span className="text-sm opacity-60">{formatDate(order.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
