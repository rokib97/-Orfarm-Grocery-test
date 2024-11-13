"use client";

import { AuthProduct } from "@/app/Services/ProductProvider/ProductProvider";
import { ChevronLeft, ChevronRight, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import dynamic from "next/dynamic";
import Image from "next/image";

// Dynamically import PaymentModel without server-side rendering
const PaymentModel = dynamic(() => import("./CheckoutForm/page.jsx"), {
  ssr: false,
});

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_API_KEY);

const ProductCartModel = () => {
  const session = useSession();
  const { setTotalPrice, totalPrice } = useContext(AuthProduct);
  const [userProduct, setUserProduct] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 4;
  const startIndex = (currentPage - 1) * itemPerPage;
  const endIndex = startIndex + itemPerPage;
  const paginationData = userProduct.slice(startIndex, endIndex);
  const totalPages = Math.ceil(userProduct.length / itemPerPage);
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  useEffect(() => {
    const carts = JSON.parse(localStorage.getItem("carts")) || [];
    setUserProduct(carts);
    setTotalPrice(carts);
  }, [setTotalPrice]);

  const product = userProduct.filter(
    (item) => item.email === session?.data?.user?.email
  );

  const handleDeleteProduct = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete it?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const filterPrd = product.filter((item) => item.prdID !== id);
        setUserProduct(filterPrd);
        localStorage.setItem("carts", JSON.stringify(filterPrd));

        Swal.fire({
          title: "Deleted!",
          text: "Your product has been deleted.",
          icon: "success",
        });
      }
    });
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalProductPrice = userProduct.reduce(
    (before, prev) => parseInt(before) + parseInt(prev.price),
    0
  );

  return (
    <Elements stripe={stripePromise}>
      <div className="bg-white md:px-8 md:py-2 overflow-auto">
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-2xl my-4">My Product</h2>
            <h2 className="text-lg md:text-2xl my-4">
              Total Price: {totalProductPrice}$
            </h2>
            <div>
              {paginationData?.length === 0 ? (
                <button className="bg-[#8498e0] px-4 text-white text-base py-[8px] rounded-md">
                  Pay
                </button>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="bg-none">
                      <button className="bg-[#8498e0] px-4 text-white text-base py-[8px] rounded-md">
                        Pay
                      </button>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <div className="p-4">
                      <PaymentModel />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Pagination and product listing */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginationData.map((product) => (
            <div
              key={product.prdID}
              className="p-4 border border-gray-200 rounded-md"
            >
              <Image
                src={product.image}
                alt={product.name}
                width={100}
                height={100}
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-500">{product.price}$</p>
              <button
                onClick={() => handleDeleteProduct(product.prdID)}
                className="text-red-500 mt-2"
              >
                <Trash /> Remove
              </button>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <Button onClick={handlePrevious} disabled={currentPage === 1}>
            <ChevronLeft /> Previous
          </Button>
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={currentPage === pageNum ? "bg-gray-300" : ""}
            >
              {pageNum}
            </Button>
          ))}
          <Button onClick={handleNext} disabled={currentPage === totalPages}>
            Next <ChevronRight />
          </Button>
        </div>
      </div>
    </Elements>
  );
};

export default ProductCartModel;
