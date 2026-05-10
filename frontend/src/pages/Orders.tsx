import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: string;
  image_url: string;
}

interface Order {
  id: number;
  user_id: number;
  total_price: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

const Orders = () => {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async (currentPage: number) => {
      if (!user) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders?user_id=${user.id}&page=${currentPage}&limit=5`);
        if (response.data && response.data.orders) {
          setOrders(response.data.orders);
          setTotalPages(response.data.total_pages);
        } else {
          setOrders(response.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders(page);
  }, [user, page]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant={"outline"} className="text-yellow-600 border-yellow-600 bg-yellow-50">进行中</Badge>;
      case 'completed':
        return <Badge variant={"outline"} className="text-green-600 border-green-600 bg-green-50">已完成</Badge>;
      case 'cancelled':
        return <Badge variant={"outline"} className="text-red-600 border-red-600 bg-red-50">已取消</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">我的订单</h1>
      
      {orders.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>暂无订单记录</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between py-4">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <CardTitle className="text-lg">订单号: #{order.id}</CardTitle>
                    <p className="text-sm text-gray-500">
                      下单时间: {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.product_name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-500">数量: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">¥{parseFloat(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 flex justify-between items-center mt-4">
                    <span className="font-bold text-lg">总计</span>
                    <span className="font-bold text-2xl text-red-600">
                      ¥{parseFloat(order.total_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="text-sm font-medium">
                第 {page} 页，共 {totalPages} 页
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
