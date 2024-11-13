"use client";

import {
  decrement,
  increment,
} from "@/app/ReduxProvider/CreateSlice/CreateSlice";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

export const AuthProduct = createContext();

const ProductProvider = ({ children }) => {
  const [singleProduct, setSingleProduct] = useState([]);
  const [singleProductLoading, setSingleProductLoading] = useState(false);
  const session = useSession();
  const count = useSelector((state) => state.counter.value);
  const [productLocation, setProductLocation] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const [myCart, setMyCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState();

  // Handling localStorage for cart
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCarts = JSON.parse(localStorage.getItem("carts")) || [];
      setMyCart(storedCarts);
    }
  }, []);

  const email = session?.data?.user?.email;

  // Fetching user data
  const { refetch: singleUserLoading, data: singleUserData = [] } = useQuery({
    queryKey: ["singleUserData", !email],
    queryFn: async () => {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/SingleUserData/${email}`
      );
      return resp?.data?.data;
    },
  });

  // Fetching user roles
  const { isLoading: userRoleLoading, data: userRole = [] } = useQuery({
    queryKey: ["userRole", !email],
    queryFn: async () => {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/AllUserRole/${email}`
      );
      return resp?.data;
    },
  });

  // Fetching all products
  const {
    refetch,
    isLoading,
    data: allProduct = [],
  } = useQuery({
    queryKey: ["allProduct"],
    queryFn: async () => {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/AllProduct`
      );
      return resp?.data?.data;
    },
  });

  // Fetching manage products
  const {
    refetch: manageRefetch,
    isLoading: manageLoading,
    data: ManageAllProduct = [],
  } = useQuery({
    queryKey: ["manageAllProduct"],
    queryFn: async () => {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/AllProductManage`
      );
      return resp?.data?.data;
    },
  });

  // Fetching single product details
  const singleProductShow = async (id) => {
    try {
      setSingleProductLoading(true);
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/SingleProduct/${id}`
      );
      setSingleProductLoading(false);
      setSingleProduct(resp?.data?.data);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Failed to fetch product details");
    }
  };

  // Add to cart functionality
  const handleAddToCart = async (prd) => {
    if (session?.status === "unauthenticated") {
      return router.push("/api/login");
    }

    const userEmail = session?.data?.user?.email;
    const updatedProduct = {
      ...prd,
      email: userEmail,
      prdID: prd._id,
      quantity: 1,
    };
    delete updatedProduct._id;
    delete updatedProduct.__v;

    let carts = JSON.parse(localStorage.getItem("carts")) || [];
    const existing = carts.find((item) => item.prdID === updatedProduct.prdID);
    if (existing) {
      return toast.error("Product Already Added");
    }
    carts.push(updatedProduct);
    localStorage.setItem("carts", JSON.stringify(carts));
    setMyCart(carts);
    toast.success("Product Added to Cart");
  };

  // Add to wishlist functionality
  const handleWishList = async (prd) => {
    const userEmail = session?.data?.user?.email;
    const updatedProduct = {
      ...prd,
      email: userEmail,
      prdID: prd._id,
      quantity: 1,
    };
    delete updatedProduct._id;
    delete updatedProduct.__v;

    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const existing = wishlist.find(
      (item) => item.prdID === updatedProduct.prdID
    );
    if (existing) {
      return toast.error("Already Added to Wishlist");
    }
    wishlist.push(updatedProduct);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    toast.success("Added to Wishlist");
  };

  // Handle adding product to cart from product details
  const handleDetailsAddToCart = async (prd) => {
    const userEmail = session?.data?.user?.email;
    if (session?.status === "unauthenticated") {
      return router.push("/api/login");
    }

    const updatedData = {
      ...prd,
      prdID: prd._id,
      quantity: count,
      email: userEmail,
      price: parseInt(prd.price) * count,
    };
    delete updatedData._id;
    delete updatedData.__v;

    let carts = JSON.parse(localStorage.getItem("carts")) || [];
    const existingIndex = carts.findIndex(
      (item) => item.prdID === updatedData.prdID
    );
    if (existingIndex !== -1) {
      carts[existingIndex] = {
        ...carts[existingIndex],
        quantity: count,
        price: parseInt(prd.price) * count,
      };
      localStorage.setItem("carts", JSON.stringify(carts));
      return toast.success("Product Updated Successfully");
    }
    carts.push(updatedData);
    localStorage.setItem("carts", JSON.stringify(carts));
    setMyCart(carts);
    toast.success("Product Added Successfully");
  };

  // Handle increment and decrement of count
  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    if (count > 1) {
      dispatch(decrement());
    }
  };

  // Handle product location, search, and category
  const handleLocation = (local) => {
    setProductLocation(local);
  };

  const handleSearch = (search) => {
    setProductSearch(search.target.value);
  };

  const handleCategory = (cate) => {
    setProductCategory(cate);
  };

  const productInfo = {
    allProduct,
    refetch,
    isLoading,
    singleProductShow,
    singleProduct,
    handleWishList,
    handleAddToCart,
    handleIncrement,
    handleDecrement,
    count,
    handleDetailsAddToCart,
    ManageAllProduct,
    manageLoading,
    setProductLocation,
    myCart,
    productLocation,
    handleLocation,
    handleSearch,
    setProductSearch,
    productSearch,
    handleCategory,
    productCategory,
    userRole,
    userRoleLoading,
    singleUserData,
    singleUserLoading,
    setTotalPrice,
    totalPrice,
    singleProductLoading,
  };

  if (typeof window !== "undefined") {
    return (
      <AuthProduct.Provider value={productInfo}>
        {children}
      </AuthProduct.Provider>
    );
  } else {
    return null;
  }
};

export default ProductProvider;
