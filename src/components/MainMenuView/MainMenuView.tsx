"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { cn } from "~/utils/cn";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { tagsTranslations } from "~/utils/tags";
import { notEmpty } from "~/utils/utils";
import { assert } from "~/utils/assert";
import { useCart } from "~/contexts/CartContext";
import { ShoppingCart, Plus, Minus, X, Copy, Check } from "lucide-react";
import { formatPrice, formatPriceDisplay } from "~/utils/formatPrice";
import { OrderCheckoutModal, type CheckoutFormData } from "../OrderSession/OrderCheckoutModal";
import { JoinOrderModal } from "../OrderSession/JoinOrderModal";
import { OrderNumberDisplay } from "../OrderSession/OrderNumberDisplay";
import { mockApi as api } from "~/lib/mockApi";

export const MainMenuView = ({ menu }: { menu: any }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { items, addItem, updateQuantity, removeItem, getTotal, getItemCount, clearCart, orderNumber, createNewOrder, joinExistingOrder, clearOrderSession } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tipPercentage, setTipPercentage] = useState(10);
  const [splitBill, setSplitBill] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showOrderNumberDisplay, setShowOrderNumberDisplay] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const { mutateAsync: initiateCheckout } = api.checkout.initiateCheckout.useMutation();

  const subtotal = getTotal();
  const tipAmount = Math.round(subtotal * (tipPercentage / 100));
  const totalWithTip = subtotal + tipAmount;
  const perPersonAmount = Math.round(totalWithTip / splitBill);

  // Handle checkout submission
  const handleCheckout = async (formData: CheckoutFormData) => {
    if (!orderNumber) {
      setCheckoutError("Order number not found. Please create a new order first.");
      return;
    }

    setIsCheckoutLoading(true);
    setCheckoutError(undefined);

    try {
      const result = await initiateCheckout({
        orderNumber,
        menuId: menu.id,
        items: items.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
        })),
        customerEmail: formData.email,
        customerPhone: formData.phone,
        tableNumber: formData.tableNumber,
        notes: formData.notes,
      });

      // Redirect to Yoco hosted checkout page
      // Customer will pay there securely
      // After payment, Yoco sends webhook to /api/webhooks/yoco
      // Webhook creates the Order record in database
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error("No checkout URL received from Yoco");
      }
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Failed to initiate checkout"
      );
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Handle joining existing order
  const handleJoinOrder = async (orderNum: string) => {
    setCheckoutError(undefined);
    try {
      joinExistingOrder(orderNum);
      setShowJoinModal(false);
      setShowOrderNumberDisplay(true);
    } catch (error) {
      setCheckoutError("Invalid order number. Please try again.");
    }
  };

  // Group dishes by category
  const categoriesWithDishes = (menu.categories || []).map((category: any) => ({
    category,
    dishes: (menu.dishes || []).filter((dish: any) => dish.categoryId === category.id)
  }));

  // Add uncategorized dishes
  const uncategorizedDishes = (menu.dishes || []).filter((dish: any) => !dish.categoryId);
  if (uncategorizedDishes.length > 0) {
    categoriesWithDishes.push({
      category: null,
      dishes: uncategorizedDishes
    });
  }

  return (
    <div className="z-0 flex h-full w-full bg-white ">
      <div className="flex w-full flex-col gap-5 ">

        <div className="flex w-full flex-row items-center justify-between px-4">
          <div>
            <h1 className="text-2xl font-bold md:text-4xl">{menu.name}</h1>
            <p className="md:text-regular text-sm text-slate-400">
              {menu?.address}, {menu.city}
            </p>
          </div>
        </div>
        <div className="sticky top-0 flex w-full flex-row items-center justify-between ">
          <CategoriesNavigation
            categories={categoriesWithDishes
              .filter(({ dishes }: any) => dishes.length > 0)
              .map(({ category }: any) => category)
              .filter((c: any) => c !== null)}
          />
        </div>

        <div className="flex flex-wrap gap-4 px-2">
          {categoriesWithDishes?.map(({ category, dishes }: any) => {
            if (!dishes.length) return null;

            return (
              <div
                key={category?.id || "no-category"}
                className="w-full min-w-full flex-1"
                id={category?.id}
              >
                <div className="flex w-full flex-col gap-4">
                  {category?.name && (
                    <h3 className="w-full px-2 text-2xl font-extrabold">
                      {category?.name}
                    </h3>
                  )}
                  <ul className="flex flex-wrap gap-2 px-2">
                    {dishes.map((dish: any) => {
                      return (
                        <li
                          key={dish.id}
                          className="flex w-full flex-col items-start justify-between gap-2 "
                        >
                          <div className="flex w-full justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col">
                                <h4 className="text-lg font-medium">
                                  {dish.name}
                                </h4>
                                <PriceCard price={dish.price} />
                              </div>
                              {dish.description && (
                                <p className="pt-1 text-sm text-slate-500">
                                  {dish.description}
                                </p>
                              )}
                              <Button
                                onClick={() => addItem({
                                  dishId: dish.id,
                                  name: dish.name,
                                  price: dish.price,
                                  pictureUrl: dish.pictureUrl
                                })}
                                className="mt-2"
                                size="sm"
                              >
                                Add to Cart
                              </Button>
                            </div>
                            {dish.pictureUrl && (
                              <Image
                                src={dish.pictureUrl}
                                alt={dish.name}
                                width={200}
                                height={200}
                                className="h-[100px] min-h-[100px] w-[100px] min-w-[100px] overflow-hidden rounded-xl object-cover"
                              />
                            )}
                          </div>
                          <hr className="w-full" />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {getItemCount() > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-primary px-6 py-4 text-white shadow-lg hover:bg-primary/90"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="font-semibold">{getItemCount()} items</span>
          <span className="font-semibold">{formatPrice(getTotal())}</span>
        </button>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <p className="text-center text-gray-500">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.dishId} className="flex gap-4 border-b pb-4">
                        {item.pictureUrl && (
                          <Image
                            src={item.pictureUrl}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="h-20 w-20 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500 font-semibold">
                            <span className="font-bold">R</span> {(item.price / 100).toFixed(2)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.dishId, item.quantity - 1)
                              }
                              className="rounded-full bg-gray-200 p-1 hover:bg-gray-300"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.dishId, item.quantity + 1)
                              }
                              className="rounded-full bg-gray-200 p-1 hover:bg-gray-300"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.dishId)}
                              className="ml-auto text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && !showCheckout && (
                <div className="border-t p-4">
                  <div className="mb-4 flex justify-between text-lg font-bold">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  {/* Order Status Display */}
                  {orderNumber && (
                    <div className="mb-4 rounded-lg bg-blue-50 p-3 text-center">
                      <p className="text-xs text-blue-700 font-medium">ORDER #</p>
                      <p className="text-lg font-bold text-blue-900">{orderNumber}</p>
                      <p className="text-xs text-blue-600 mt-1">Shared order - others can join</p>
                    </div>
                  )}

                  {/* Order Action Buttons */}
                  {!orderNumber ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          createNewOrder();
                          setShowOrderNumberDisplay(true);
                        }}
                        className="w-full"
                        size="lg"
                      >
                        Create New Order
                      </Button>
                      <Button
                        onClick={() => setShowJoinModal(true)}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        Join Existing Order
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowCheckout(true)}
                      className="w-full"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                  )}

                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="mt-2 w-full"
                  >
                    Clear Cart
                  </Button>
                </div>
              )}

              {items.length > 0 && showCheckout && (
                <div className="border-t p-4 space-y-4">
                  {/* Tip Selection */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Add Tip
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[10, 12, 15, 17, 20].map((percent) => (
                        <button
                          key={percent}
                          onClick={() => setTipPercentage(percent)}
                          className={cn(
                            "rounded-lg border-2 py-2 text-sm font-medium transition-colors",
                            tipPercentage === percent
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 hover:border-primary"
                          )}
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Split Bill */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Split Bill
                    </label>
                    <select
                      value={splitBill}
                      onChange={(e) => setSplitBill(Number(e.target.value))}
                      className="w-full rounded-lg border-2 border-gray-200 p-2"
                    >
                      {Array.from({ length: 19 }, (_, i) => i + 2).map((num) => (
                        <option key={num} value={num}>
                          {num} people
                        </option>
                      ))}
                      <option value={1}>1 person (no split)</option>
                    </select>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tip ({tipPercentage}%):</span>
                      <span>{formatPrice(tipAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Total:</span>
                      <span>{formatPrice(totalWithTip)}</span>
                    </div>
                    {splitBill > 1 && (
                      <div className="flex justify-between border-t pt-2 text-sm font-semibold text-primary">
                        <span>Per Person ({splitBill} people):</span>
                        <span>{formatPrice(perPersonAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-600">
                    <p>Secure payment powered by Yoco</p>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={() => setShowCheckoutModal(true)}
                    className="w-full"
                    size="lg"
                  >
                    Pay {formatPrice(totalWithTip)}
                  </Button>
                  <Button
                    onClick={() => setShowCheckout(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Cart
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Order Number Display Modal */}
      {showOrderNumberDisplay && orderNumber && (
        <OrderNumberDisplay
          orderNumber={orderNumber}
          onClose={() => setShowOrderNumberDisplay(false)}
        />
      )}

      {/* Join Order Modal */}
      {showJoinModal && (
        <JoinOrderModal
          onJoin={handleJoinOrder}
          onCancel={() => setShowJoinModal(false)}
        />
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && orderNumber && (
        <OrderCheckoutModal
          orderNumber={orderNumber}
          totalPrice={totalWithTip}
          itemCount={items.length}
          onCheckout={handleCheckout}
          onCancel={() => setShowCheckoutModal(false)}
          isLoading={isCheckoutLoading}
          error={checkoutError}
        />
      )}
    </div>
  );
};

const Tags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row flex-wrap gap-2 py-1">
      {tags.map((tag, index) => (
        <Badge variant="secondary" key={index}>
          {tag}
        </Badge>
      ))}
    </div>
  );
};

const PriceCard = ({ price }: { price: number }) => {
  const { symbol, amount } = formatPriceDisplay(price);
  return (
    <div className="flex gap-0.5 items-center">
      <span className="text-base font-bold">{symbol}</span>
      <div className="text-sm">{amount}</div>
    </div>
  );
};

const NAVIGATION_HEIGHT = 40;

const CategoriesNavigation = ({
  categories,
}: {
  categories: any[];
}) => {
  const [visibleSetionsIds, setVisibleSetionsIds] = useState<string[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    };

    slider.addEventListener("mousedown", onMouseDown);

    const onMouseLeave = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    slider.addEventListener("mouseleave", onMouseLeave);

    const onMouseUp = () => {
      isDown = false;
      slider.classList.remove("active");
    };

    slider.addEventListener("mouseup", onMouseUp);

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3;

      slider.scrollLeft = scrollLeft - walk;
    };

    slider.addEventListener("mousemove", onMouseMove);

    return () => {
      slider.removeEventListener("mousedown", onMouseDown);
      slider.removeEventListener("mouseleave", onMouseLeave);
      slider.removeEventListener("mouseup", onMouseUp);
      slider.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      className="z-10 flex  w-screen max-w-3xl overflow-auto border-b-4 border-b-slate-200 bg-white scrollbar-none"
      ref={sliderRef}
      style={{ height: NAVIGATION_HEIGHT }}
    >
      {categories.map((category) => (
        <SingleCategory
          onVisibilityChange={(isVisible) => {
            setVisibleSetionsIds((prevVisibleSectionsIds) => {
              let newVisibleSectionIds = [...prevVisibleSectionsIds];

              if (isVisible)
                newVisibleSectionIds = [...prevVisibleSectionsIds, category.id];
              if (!isVisible)
                newVisibleSectionIds = prevVisibleSectionsIds.filter(
                  (id) => id !== category.id,
                );

              if (
                category.id ===
                newVisibleSectionIds[newVisibleSectionIds.length - 1]
              ) {
                const element = document.getElementById(`${category.id}-nav`);

                assert(!!element, "Element should exist");
                const elementOffsetLeft = element?.offsetLeft - 30;

                assert(!!sliderRef.current, "Slider should exist");
                sliderRef.current.scrollTo({
                  left: elementOffsetLeft,
                  behavior: "smooth",
                });
              }

              return newVisibleSectionIds;
            });
          }}
          isLastVisibleSection={
            category.id === visibleSetionsIds?.[visibleSetionsIds.length - 1]
          }
          key={category.id}
          category={category}
        />
      ))}
    </div>
  );
};

const VariantCard = ({
  description,
  name,
  price,
}: {
  name: string;
  price: number | null;
  description: string | null;
}) => {
  return (
    <div className="flex w-full flex-col pl-4 last:pb-2">
      <div className="align flex w-full justify-between">
        <h4 className="text-sm font-medium ">{name}</h4>
        {price && <PriceCard price={price} />}
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
};

const MacroCard = ({
  carbohydrates,
  fat,
  calories,
  protein,
}: {
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
}) => {
  return (
    <div className="flex items-end gap-1 text-xs">
      {calories && <p>Kcal: {calories}</p>}
      {protein && <p>P: {protein}</p>}
      {carbohydrates && <p>C: {carbohydrates}</p>}
      {fat && <p>F: {fat}</p>}
    </div>
  );
};

const SingleCategory = ({
  category,
  isLastVisibleSection,
  onVisibilityChange,
}: {
  category: any;
  isLastVisibleSection: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
}) => {
  const { ref, inView } = useInView({
    onChange(_inView) {
      onVisibilityChange(_inView);
    },
  });
  const navigateToCategory = useCallback(() => {
    const element = document.getElementById(category.id);

    if (element) {
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const finalScrollPosition = absoluteElementTop - NAVIGATION_HEIGHT - 20;

      window.scrollTo({
        top: finalScrollPosition,
        behavior: "smooth",
      });
    }
  }, [category.id]);

  useEffect(() => {
    ref(document.getElementById(category.id));
  }, [category.id, ref]);

  return (
    <div
      onClick={navigateToCategory}
      className={cn(
        "whitespace-nowrap   bg-white px-4 py-2 text-sm font-medium  text-slate-500 hover:cursor-pointer",
        inView && isLastVisibleSection && "bg-slate-200 text-black",
      )}
      id={`${category.id}-nav`}
    >
      {category.name}
    </div>
  );
};
