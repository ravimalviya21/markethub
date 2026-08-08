import { App } from "antd";
import { useRouter } from "next/router";

import { useSession } from "@/config/session";
import { useAddToCart, useBuyerCart } from "@/services/cart.service";
import { getApiErrorMessage } from "@/utils/customMethods";

export const useCartActions = () => {
    const router = useRouter();
    const { message } = App.useApp();
    const { isAuthenticated, role } = useSession();

    const cart = useBuyerCart();
    const addToCart = useAddToCart();

    const canShop = () => {
        if (!isAuthenticated) {
            message.warning("Sign in to add items to your cart");
            router.push("/auth/login");
            return false;
        }
        if (role !== "buyer") {
            message.warning("Only buyer accounts can add items to a cart");
            return false;
        }
        return true;
    };

    const addProductToCart = async (productId: number, productName: string, quantity = 1) => {
        if (!canShop()) return;
        try {
            await addToCart.mutateAsync({ productId, quantity });
            message.success(`${productName} added to cart`);
        } catch (error) {
            message.error(getApiErrorMessage(error, "Could not add this item to your cart"));
        }
    };

    return {
        addProductToCart,
        cartCount: cart.data?.summary.totalQuantity ?? 0,
        isAdding: addToCart.isPending,
    };
};
