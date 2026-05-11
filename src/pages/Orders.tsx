import React, { useState, useMemo } from "react";
import Pagination from "../components/common/Pagination";

// ─── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus       = "დადასტურებული" | "მიმდინარე" | "დასრულებული" | "გაუქმებული" | "მოლოდინში";
type DeliveryStatus    = "გაგზავნილი" | "მიტანილი" | "გაუქმებული" | "არ აქვს";
type PaymentStatus     = "გადახდილია" | "მოლოდინში" | "გაუქმებული" | "დაბრუნება";
type FulfillmentStatus = "მომზადება" | "შეფუთულია" | "გაგზავნილია" | "გაუქმებულია" | "—";
type DeliveryMethod    = "გატანა" | "მიტანა";

interface OrderItem {
  id: number;
  name: string;
  sku: string;
  iconType: "headphones" | "mouse" | "gamepad" | "phone" | "laptop" | "tablet" | "shoe" | "watch" | "box";
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;       // ISO for sorting
  updatedAt: string;       // ISO
  customerName: string;
  totalAmount: number;
  itemsCount: number;
  deliveryMethod: DeliveryMethod;
  scheduledAt: string | null; // "MM/DD HH:MM AP"
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  deliveryStatus: DeliveryStatus;
  deliveryFee: number;
  items: OrderItem[];
}

// ─── Status Config ─────────────────────────────────────────────────────────────

const ORDER_STATUS_CLS: Record<OrderStatus, string> = {
  "დადასტურებული": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "მიმდინარე":      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "დასრულებული":    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "გაუქმებული":     "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "მოლოდინში":      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const DELIVERY_STATUS_CLS: Record<DeliveryStatus, string> = {
  "გაგზავნილი": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "მიტანილი":   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "გაუქმებული": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "არ აქვს":    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const PAYMENT_STATUS_CLS: Record<PaymentStatus, string> = {
  "გადახდილია": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "მოლოდინში":  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "გაუქმებული": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "დაბრუნება":  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const PAGE_SIZE = 10;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}:${ss}`;
}

function fmtMoney(n: number): string {
  return "₾" + n.toLocaleString("en-US");
}

// ─── Sample-data builder ────────────────────────────────────────────────────────

type ItemTup = [string, string, OrderItem["iconType"], number, number];

function mkOrd(
  n: number,
  dt: string,
  upd: string,
  cust: string,
  meth: DeliveryMethod,
  sched: string | null,
  os: OrderStatus,
  ps: PaymentStatus,
  fs: FulfillmentStatus,
  ds: DeliveryStatus,
  its: ItemTup[],
  fee: number
): Order {
  const items: OrderItem[] = its.map(([name, sku, iconType, qty, price], i) => ({
    id: i + 1, name, sku, iconType, qty, price,
  }));
  return {
    id: `ORD-UUID-${String(n).padStart(4, "0")}`,
    orderNumber: `#${10000 + n}`,
    orderDate: dt,
    updatedAt: upd,
    customerName: cust,
    totalAmount: items.reduce((s, i) => s + i.qty * i.price, 0) + fee,
    itemsCount: items.length,
    deliveryMethod: meth,
    scheduledAt: sched,
    orderStatus: os,
    paymentStatus: ps,
    fulfillmentStatus: fs,
    deliveryStatus: ds,
    deliveryFee: fee,
    items,
  };
}

// ─── Mock Data (48 orders) ─────────────────────────────────────────────────────

const ORDERS: Order[] = [
  // ── Page 1 (matches screenshot first-page ordering) ──────────────────────────
  mkOrd(46,"2026-04-29T05:03:17","2026-04-29T05:03:17","ევა ლომიძე","გატანა","05/03 07:00 PM",
    "დადასტურებული","გადახდილია","შეფუთულია","გაგზავნილი",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Samsung Galaxy S24","SAM-S24U","phone",1,2200],["Calvin Klein Watch","CK-W001","watch",1,890]],0),

  mkOrd(25,"2026-04-28T13:58:22","2026-04-28T13:58:22","ნინო კვარაცხელია","გატანა","05/04 03:00 PM",
    "მიმდინარე","მოლოდინში","მომზადება","არ აქვს",
    [["iPad Air 5","APL-IPAD-A5","tablet",1,1800],["Logitech MX Master 3","LOG-MX3","mouse",2,180],["Nike Air Max 270","NIK-AM270","shoe",1,350]],0),

  mkOrd(43,"2026-04-28T01:17:05","2026-04-28T01:17:05","დავით ბერიძე","გატანა",null,
    "დასრულებული","გადახდილია","გაგზავნილია","გაუქმებული",
    [["Logitech MX Master 3","LOG-MX3","mouse",1,180]],0),

  mkOrd(47,"2026-04-27T17:40:31","2026-04-27T17:40:31","თამარ ბაგრატიონი","მიტანა",null,
    "მიმდინარე","გადახდილია","შეფუთულია","გაუქმებული",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["Apple iPhone 15 Pro","APL-IP15P","phone",2,3800],["Samsung Galaxy S24","SAM-S24U","phone",1,2200],["Sony WH-1000XM5","SNY-WH5","headphones",2,650],["iPad Air 5","APL-IPAD-A5","tablet",1,1800]],40),

  mkOrd(3,"2026-04-27T17:09:44","2026-04-27T17:09:44","ბეკა ჩხაიძე","გატანა",null,
    "გაუქმებული","გაუქმებული","გაუქმებულია","არ აქვს",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["Sony WH-1000XM5","SNY-WH5","headphones",3,650],["Calvin Klein Watch","CK-W001","watch",2,890]],0),

  mkOrd(29,"2026-04-25T20:10:09","2026-04-25T20:10:09","ნინო კვარაცხელია","მიტანა","04/26 04:00 PM",
    "გაუქმებული","დაბრუნება","გაუქმებულია","გაგზავნილი",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["Samsung Galaxy S24","SAM-S24U","phone",1,2200],["iPad Air 5","APL-IPAD-A5","tablet",1,1800]],35),

  mkOrd(23,"2026-04-25T18:52:14","2026-04-25T18:52:14","ლეიდი ქობალია","მიტანა","04/26 07:30 PM",
    "მიმდინარე","გადახდილია","გაგზავნილია","მიტანილი",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Sony WH-1000XM5","SNY-WH5","headphones",2,650],["Logitech MX Master 3","LOG-MX3","mouse",1,180],["Calvin Klein Watch","CK-W001","watch",1,890],["Nike Air Max 270","NIK-AM270","shoe",2,350]],45),

  mkOrd(48,"2026-04-25T09:08:33","2026-04-25T09:08:33","მიხეილ გახმაძე","გატანა","04/29 10:00 AM",
    "დასრულებული","გადახდილია","გაგზავნილია","გაგზავნილი",
    [["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["Sony WH-1000XM5","SNY-WH5","headphones",1,650],["Adidas Ultraboost 22","ADI-UB22","shoe",2,420],["Logitech MX Master 3","LOG-MX3","mouse",1,180]],0),

  mkOrd(19,"2026-04-24T14:19:55","2026-04-24T14:19:55","მარიამ ჯოხაძე","მიტანა","04/29 03:00 PM",
    "მიმდინარე","გადახდილია","შეფუთულია","მიტანილი",
    [["Samsung Galaxy S24","SAM-S24U","phone",1,2200],["iPad Air 5","APL-IPAD-A5","tablet",1,1800],["Sony WH-1000XM5","SNY-WH5","headphones",2,650],["Calvin Klein Watch","CK-W001","watch",1,890]],30),

  mkOrd(18,"2026-04-24T13:45:02","2026-04-24T13:45:02","ევა ლომიძე","გატანა","04/29 05:30 PM",
    "მოლოდინში","მოლოდინში","მომზადება","მიტანილი",
    [["Nike Air Max 270","NIK-AM270","shoe",2,350],["Adidas Ultraboost 22","ADI-UB22","shoe",1,420]],0),

  // ── Page 2 ────────────────────────────────────────────────────────────────────
  mkOrd(21,"2026-04-27T16:43:00","2026-04-27T16:43:00","ევა ლომიძე","გატანა","05/02 09:30 AM",
    "დასრულებული","გადახდილია","გაგზავნილია","გაგზავნილი",
    [["Sony WH-1000XM5","SNY-WH5","headphones",4,650],["Logitech MX Master 3","LOG-MX3","mouse",1,180],["PlayStation 5","SNY-PS5-STD","gamepad",3,1500]],220),

  mkOrd(44,"2026-04-24T11:20:00","2026-04-24T11:20:00","გიორგი ბერიძე","მიტანა","04/27 02:00 PM",
    "დადასტურებული","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["Samsung Galaxy S24","SAM-S24U","phone",1,2200]],25),

  mkOrd(37,"2026-04-23T19:05:11","2026-04-23T19:05:11","სოფიო ჩიქოვანი","გატანა","04/26 11:00 AM",
    "დასრულებული","გადახდილია","გაგზავნილია","გაგზავნილი",
    [["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["Adidas Ultraboost 22","ADI-UB22","shoe",1,420]],0),

  mkOrd(31,"2026-04-23T15:33:44","2026-04-23T15:33:44","ლელა ხარებავა","მიტანა","04/25 06:00 PM",
    "მიმდინარე","გადახდილია","შეფუთულია","გაგზავნილი",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Sony WH-1000XM5","SNY-WH5","headphones",1,650],["Logitech MX Master 3","LOG-MX3","mouse",2,180]],35),

  mkOrd(16,"2026-04-23T10:12:58","2026-04-23T10:12:58","ნიკა ხვედელიძე","გატანა",null,
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["PlayStation 5","SNY-PS5-STD","gamepad",1,1500],["Calvin Klein Watch","CK-W001","watch",1,890]],0),

  mkOrd(40,"2026-04-22T21:47:30","2026-04-22T21:47:30","ანა სიგუა","მიტანა","04/25 10:00 AM",
    "მოლოდინში","მოლოდინში","მომზადება","გაგზავნილი",
    [["Samsung Galaxy S24","SAM-S24U","phone",2,2200],["iPad Air 5","APL-IPAD-A5","tablet",1,1800],["Nike Air Max 270","NIK-AM270","shoe",2,350]],30),

  mkOrd(14,"2026-04-22T16:58:09","2026-04-22T16:58:09","ზვიად ლომსაძე","გატანა",null,
    "გაუქმებული","გაუქმებული","გაუქმებულია","არ აქვს",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800]],0),

  mkOrd(33,"2026-04-22T09:22:15","2026-04-22T09:22:15","ქეთი ჩიქოვანი","მიტანა","04/24 03:00 PM",
    "მიმდინარე","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Sony WH-1000XM5","SNY-WH5","headphones",2,650],["Adidas Ultraboost 22","ADI-UB22","shoe",2,420],["Logitech MX Master 3","LOG-MX3","mouse",1,180]],20),

  mkOrd(9,"2026-04-21T18:40:00","2026-04-21T18:40:00","ლუკა კვარაცხელია","გატანა","04/24 12:00 PM",
    "დადასტურებული","გადახდილია","შეფუთულია","გაგზავნილი",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Calvin Klein Watch","CK-W001","watch",2,890]],0),

  mkOrd(27,"2026-04-21T14:11:33","2026-04-21T14:11:33","მარინა ჯიქია","მიტანა",null,
    "გაუქმებული","გაუქმებული","გაუქმებულია","გაუქმებული",
    [["iPad Air 5","APL-IPAD-A5","tablet",2,1800],["Nike Air Max 270","NIK-AM270","shoe",3,350]],25),

  // ── Page 3 ────────────────────────────────────────────────────────────────────
  mkOrd(42,"2026-04-21T08:30:22","2026-04-21T08:30:22","დიმიტრი ასათიანი","გატანა","04/23 09:00 AM",
    "მიმდინარე","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Apple iPhone 15 Pro","APL-IP15P","phone",2,3800],["Sony WH-1000XM5","SNY-WH5","headphones",1,650]],0),

  mkOrd(11,"2026-04-20T20:15:44","2026-04-20T20:15:44","ნინო ღლონტი","მიტანა","04/22 04:00 PM",
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["Samsung Galaxy S24","SAM-S24U","phone",1,2200],["Logitech MX Master 3","LOG-MX3","mouse",1,180],["Nike Air Max 270","NIK-AM270","shoe",2,350]],30),

  mkOrd(36,"2026-04-20T15:05:18","2026-04-20T15:05:18","გოჩა ელიავა","გატანა",null,
    "მოლოდინში","მოლოდინში","მომზადება","არ აქვს",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["Adidas Ultraboost 22","ADI-UB22","shoe",1,420],["Calvin Klein Watch","CK-W001","watch",1,890]],0),

  mkOrd(22,"2026-04-20T11:50:07","2026-04-20T11:50:07","ევა ლომიძე","მიტანა","04/22 11:00 AM",
    "დასრულებული","გადახდილია","გაგზავნილია","გაგზავნილი",
    [["PlayStation 5","SNY-PS5-STD","gamepad",2,1500],["Sony WH-1000XM5","SNY-WH5","headphones",1,650],["Logitech MX Master 3","LOG-MX3","mouse",2,180]],35),

  mkOrd(5,"2026-04-19T22:33:50","2026-04-19T22:33:50","ნინო კვარაცხელია","გატანა","04/21 10:00 AM",
    "დადასტურებული","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["iPad Air 5","APL-IPAD-A5","tablet",1,1800],["Adidas Ultraboost 22","ADI-UB22","shoe",2,420]],0),

  mkOrd(17,"2026-04-19T17:20:14","2026-04-19T17:20:14","დავით ბერიძე","მიტანა",null,
    "გაუქმებული","დაბრუნება","გაუქმებულია","გაუქმებული",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Calvin Klein Watch","CK-W001","watch",1,890]],15),

  mkOrd(39,"2026-04-19T09:44:29","2026-04-19T09:44:29","თამარ ბაგრატიონი","გატანა","04/21 02:00 PM",
    "მიმდინარე","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Samsung Galaxy S24","SAM-S24U","phone",2,2200],["Sony WH-1000XM5","SNY-WH5","headphones",2,650],["Nike Air Max 270","NIK-AM270","shoe",1,350]],0),

  mkOrd(8,"2026-04-18T19:58:01","2026-04-18T19:58:01","ბეკა ჩხაიძე","მიტანა","04/20 03:30 PM",
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["Logitech MX Master 3","LOG-MX3","mouse",1,180],["Adidas Ultraboost 22","ADI-UB22","shoe",1,420]],40),

  mkOrd(32,"2026-04-18T14:27:39","2026-04-18T14:27:39","ლეიდი ქობალია","გატანა",null,
    "მოლოდინში","მოლოდინში","მომზადება","არ აქვს",
    [["iPad Air 5","APL-IPAD-A5","tablet",1,1800],["PlayStation 5","SNY-PS5-STD","gamepad",1,1500]],0),

  mkOrd(45,"2026-04-18T08:13:55","2026-04-18T08:13:55","მიხეილ გახმაძე","მიტანა","04/20 09:00 AM",
    "დადასტურებული","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["Calvin Klein Watch","CK-W001","watch",2,890],["Nike Air Max 270","NIK-AM270","shoe",3,350]],30),

  // ── Page 4 ────────────────────────────────────────────────────────────────────
  mkOrd(13,"2026-04-17T21:05:11","2026-04-17T21:05:11","მარიამ ჯოხაძე","გატანა","04/19 11:00 AM",
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Sony WH-1000XM5","SNY-WH5","headphones",1,650]],0),

  mkOrd(26,"2026-04-17T17:41:08","2026-04-17T17:41:08","გიორგი ბერიძე","მიტანა","04/19 05:00 PM",
    "მიმდინარე","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Samsung Galaxy S24","SAM-S24U","phone",1,2200],["iPad Air 5","APL-IPAD-A5","tablet",1,1800],["Logitech MX Master 3","LOG-MX3","mouse",1,180]],25),

  mkOrd(41,"2026-04-17T12:22:47","2026-04-17T12:22:47","სოფიო ჩიქოვანი","გატანა",null,
    "გაუქმებული","გაუქმებული","გაუქმებულია","გაუქმებული",
    [["Dell XPS 15","DEL-XPS15","laptop",2,4500],["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800]],0),

  mkOrd(7,"2026-04-17T07:55:00","2026-04-17T07:55:00","ლელა ხარებავა","მიტანა",null,
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["PlayStation 5","SNY-PS5-STD","gamepad",1,1500],["Sony WH-1000XM5","SNY-WH5","headphones",2,650],["Adidas Ultraboost 22","ADI-UB22","shoe",1,420]],35),

  mkOrd(34,"2026-04-16T20:30:22","2026-04-16T20:30:22","ნიკა ხვედელიძე","გატანა","04/18 10:00 AM",
    "დადასტურებული","გადახდილია","შეფუთულია","გაგზავნილი",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Logitech MX Master 3","LOG-MX3","mouse",1,180],["Calvin Klein Watch","CK-W001","watch",1,890]],0),

  mkOrd(20,"2026-04-16T15:15:33","2026-04-16T15:15:33","ანა სიგუა","მიტანა","04/18 02:00 PM",
    "მიმდინარე","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["Nike Air Max 270","NIK-AM270","shoe",2,350]],20),

  mkOrd(4,"2026-04-16T10:05:19","2026-04-16T10:05:19","ზვიად ლომსაძე","გატანა",null,
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["Samsung Galaxy S24","SAM-S24U","phone",1,2200],["iPad Air 5","APL-IPAD-A5","tablet",1,1800],["Adidas Ultraboost 22","ADI-UB22","shoe",1,420]],0),

  mkOrd(38,"2026-04-15T22:48:07","2026-04-15T22:48:07","ქეთი ჩიქოვანი","მიტანა","04/17 06:00 PM",
    "მოლოდინში","მოლოდინში","მომზადება","გაგზავნილი",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["Sony WH-1000XM5","SNY-WH5","headphones",3,650]],40),

  mkOrd(12,"2026-04-15T18:33:44","2026-04-15T18:33:44","ლუკა კვარაცხელია","გატანა","04/17 09:00 AM",
    "დადასტურებული","გადახდილია","შეფუთულია","გაგზავნილი",
    [["PlayStation 5","SNY-PS5-STD","gamepad",2,1500],["Calvin Klein Watch","CK-W001","watch",1,890],["Logitech MX Master 3","LOG-MX3","mouse",2,180]],0),

  mkOrd(30,"2026-04-15T11:20:58","2026-04-15T11:20:58","მარინა ჯიქია","მიტანა",null,
    "გაუქმებული","გაუქმებული","გაუქმებულია","გაუქმებული",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800]],15),

  // ── Page 5 ────────────────────────────────────────────────────────────────────
  mkOrd(2,"2026-04-14T19:12:33","2026-04-14T19:12:33","დიმიტრი ასათიანი","გატანა","04/16 03:00 PM",
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["Samsung Galaxy S24","SAM-S24U","phone",2,2200],["Sony WH-1000XM5","SNY-WH5","headphones",1,650],["Nike Air Max 270","NIK-AM270","shoe",2,350]],0),

  mkOrd(35,"2026-04-14T14:08:21","2026-04-14T14:08:21","ნინო ღლონტი","მიტანა","04/16 11:00 AM",
    "მიმდინარე","გადახდილია","შეფუთულია","გაგზავნილი",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["iPad Air 5","APL-IPAD-A5","tablet",1,1800],["Adidas Ultraboost 22","ADI-UB22","shoe",2,420]],35),

  mkOrd(24,"2026-04-14T09:55:00","2026-04-14T09:55:00","გოჩა ელიავა","გატანა",null,
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["Calvin Klein Watch","CK-W001","watch",2,890]],0),

  mkOrd(6,"2026-04-13T21:40:15","2026-04-13T21:40:15","ევა ლომიძე","მიტანა","04/15 04:00 PM",
    "დადასტურებული","გადახდილია","შეფუთულია","გაგზავნილი",
    [["MacBook Air M3","APL-MBA-M3","laptop",1,5200],["Logitech MX Master 3","LOG-MX3","mouse",1,180],["Adidas Ultraboost 22","ADI-UB22","shoe",1,420]],30),

  mkOrd(28,"2026-04-13T16:05:38","2026-04-13T16:05:38","ნინო კვარაცხელია","გატანა","04/15 01:00 PM",
    "მიმდინარე","გადახდილია","შეფუთულია","გაგზავნილი",
    [["PlayStation 5","SNY-PS5-STD","gamepad",1,1500],["Sony WH-1000XM5","SNY-WH5","headphones",2,650],["Nike Air Max 270","NIK-AM270","shoe",3,350]],0),

  mkOrd(15,"2026-04-13T10:30:27","2026-04-13T10:30:27","დავით ბერიძე","მიტანა",null,
    "გაუქმებული","გაუქმებული","გაუქმებულია","გაუქმებული",
    [["Samsung Galaxy S24","SAM-S24U","phone",1,2200],["iPad Air 5","APL-IPAD-A5","tablet",1,1800]],20),

  mkOrd(10,"2026-04-12T19:15:00","2026-04-12T19:15:00","თამარ ბაგრატიონი","გატანა","04/14 09:00 AM",
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["Dell XPS 15","DEL-XPS15","laptop",1,4500],["Calvin Klein Watch","CK-W001","watch",1,890],["Logitech MX Master 3","LOG-MX3","mouse",1,180]],0),

  mkOrd(1,"2026-04-12T15:05:49","2026-04-12T15:05:49","ბეკა ჩხაიძე","მიტანა","04/14 05:30 PM",
    "დასრულებული","გადახდილია","გაგზავნილია","მიტანილი",
    [["Apple iPhone 15 Pro","APL-IP15P","phone",1,3800],["Sony WH-1000XM5","SNY-WH5","headphones",1,650]],25),
];

// Sort by date descending
ORDERS.sort((a, b) => b.orderDate.localeCompare(a.orderDate));

// ─── Icons ─────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ChevronDownIcon = ({ cls = "" }: { cls?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);


function ProductIcon({ type }: { type: OrderItem["iconType"] }) {
  const map: Record<OrderItem["iconType"], React.ReactElement> = {
    headphones: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1"/><path d="M21 19v-3a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v3"/></svg>,
    mouse: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="6" y="3" width="12" height="18" rx="6"/><line x1="12" y1="3" x2="12" y2="9"/></svg>,
    gamepad: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.543-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>,
    phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    laptop: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>,
    tablet: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
    shoe: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 18l4-4h4l2-6h6l2 4H8l-2 6z"/></svg>,
    watch: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="7"/><polyline points="12 9 12 12 13.5 13.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"/></svg>,
    box: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  };
  return (
    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 flex-shrink-0">
      {map[type]}
    </div>
  );
}

// ─── Badge components ──────────────────────────────────────────────────────────

function StatusBadge({ label, cls }: { label: string; cls: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
      {label}
    </span>
  );
}

function DeliveryBadge({ method }: { method: DeliveryMethod }) {
  if (method === "გატანა") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        გატანა
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 whitespace-nowrap">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
      მიტანი
    </span>
  );
}

// ─── Expanded row ──────────────────────────────────────────────────────────────

function ExpandedRow({ order }: { order: Order }) {
  return (
    <tr>
      <td colSpan={11} className="px-0 py-0">
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/60 px-6 py-4">
          {/* Products header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
              შეკვეთილი პროდუქცია — {order.orderNumber}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
              {order.itemsCount} პოზიცია
            </span>
          </div>

          {/* Product list */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                <ProductIcon type={item.iconType} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                </div>
                <div className="flex items-center gap-6 text-sm flex-shrink-0">
                  <span className="text-gray-500 dark:text-gray-400 w-8 text-right">×{item.qty}</span>
                  <span className="font-semibold text-gray-800 dark:text-white/90 w-20 text-right">{fmtMoney(item.price)}</span>
                  <span className="text-gray-400 dark:text-gray-500 w-24 text-right">= {fmtMoney(item.qty * item.price)}</span>
                </div>
              </div>
            ))}

            {/* Delivery fee */}
            {order.deliveryFee > 0 && (
              <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/40">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600 flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
                <span className="flex-1 text-sm text-gray-500 dark:text-gray-400">მიწოდების თანხა</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-24 text-right">{fmtMoney(order.deliveryFee)}</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-end mt-3">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              ჯამი:&nbsp;
              <span className="text-base text-gray-900 dark:text-white">{fmtMoney(order.totalAmount)}</span>
            </span>
          </div>

          {/* Extra statuses */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">გადახდა:</span>
              <StatusBadge label={order.paymentStatus} cls={PAYMENT_STATUS_CLS[order.paymentStatus]} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">შესრულება:</span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 whitespace-nowrap">{order.fulfillmentStatus}</span>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [search, setSearch]             = useState("");
  const [filterOS, setFilterOS]         = useState<OrderStatus | "">("");
  const [filterDS, setFilterDS]         = useState<DeliveryStatus | "">("");
  const [filterMethod, setFilterMethod] = useState<DeliveryMethod | "">("");
  const [filterSched, setFilterSched]   = useState<"" | "yes" | "no">("");
  const [page, setPage]                 = useState(1);
  const [expanded, setExpanded]         = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ORDERS.filter(o => {
      if (search) {
        const q = search.toLowerCase();
        if (!o.orderNumber.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q) && !o.id.toLowerCase().includes(q)) return false;
      }
      if (filterOS && o.orderStatus !== filterOS) return false;
      if (filterDS && o.deliveryStatus !== filterDS) return false;
      if (filterMethod && o.deliveryMethod !== filterMethod) return false;
      if (filterSched === "yes" && !o.scheduledAt) return false;
      if (filterSched === "no" && o.scheduledAt) return false;
      return true;
    });
  }, [search, filterOS, filterDS, filterMethod, filterSched]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPage = () => setPage(1);

  // Stats
  const total       = ORDERS.length;
  const completed   = ORDERS.filter(o => o.orderStatus === "დასრულებული").length;
  const pending     = ORDERS.filter(o => o.orderStatus !== "დასრულებული" && o.orderStatus !== "გაუქმებული").length;
  const totalAmount = ORDERS.reduce((s, o) => s + o.totalAmount, 0);
  const shipped     = ORDERS.filter(o => o.deliveryStatus === "გაგზავნილი").length;

  const selectCls = "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer";

  const STATS = [
    { label: "სულ შეკვეთა",   value: total,    sub: "ყველა სტატუსი",     valCls: "text-gray-800 dark:text-white/90",    bar: "bg-gray-400" },
    { label: "დასრულებული",   value: completed, sub: "completed",         valCls: "text-green-600 dark:text-green-400",  bar: "bg-green-500" },
    { label: "მიმდინარე",     value: pending,   sub: "pending / processing", valCls: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
    { label: "ჯამური თანხა",  value: fmtMoney(totalAmount), sub: "ყველა შეკვეთა",   valCls: "text-green-600 dark:text-green-400",  bar: "bg-violet-500", isAmt: true },
    { label: "გაგზავნილი",    value: shipped,   sub: "გიტანის სტატუსი",  valCls: "text-blue-600 dark:text-blue-400",    bar: "bg-blue-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">შეკვეთების მართვა</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">სულ {total} შეკვეთა</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] px-5 py-4 overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.bar}`} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            {(s as { isAmt?: boolean }).isAmt ? (
              <p className={`text-2xl font-bold ${s.valCls}`}>{s.value}</p>
            ) : (
              <p className={`text-3xl font-bold ${s.valCls}`}>{s.value}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><SearchIcon /></span>
          <input
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 pl-9 pr-3 py-2.5 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ნომერი, მომხმარებელი..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage(); }}
          />
        </div>
        <select value={filterOS} onChange={e => { setFilterOS(e.target.value as OrderStatus | ""); resetPage(); }} className={selectCls}>
          <option value="">შეკვეთის სტატუსი</option>
          {(["დადასტურებული","მიმდინარე","დასრულებული","გაუქმებული","მოლოდინში"] as OrderStatus[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filterDS} onChange={e => { setFilterDS(e.target.value as DeliveryStatus | ""); resetPage(); }} className={selectCls}>
          <option value="">მიტანის სტატუსი</option>
          {(["გაგზავნილი","მიტანილი","გაუქმებული","არ აქვს"] as DeliveryStatus[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={filterMethod} onChange={e => { setFilterMethod(e.target.value as DeliveryMethod | ""); resetPage(); }} className={selectCls}>
          <option value="">მიწოდების ტიპი</option>
          <option value="გატანა">გატანა</option>
          <option value="მიტანა">მიტანა</option>
        </select>
        <select value={filterSched} onChange={e => { setFilterSched(e.target.value as "" | "yes" | "no"); resetPage(); }} className={selectCls}>
          <option value="">დაგეგმვა</option>
          <option value="yes">გაგეგმილი</option>
          <option value="no">დაუგეგმავი</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                {["ORDER ID","შეკვ. №","თარიღი","განახლება","მომხმარებელი","თანხა","პოზ.","ტიპი","დაგეგმვა","შეკვ. სტატუსი","მიტ. სტატუსი"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {pageItems.map(order => (
                <>
                  <tr
                    key={order.id}
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap">{order.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{order.orderNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap font-mono">{fmtDateTime(order.orderDate)}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap font-mono">{fmtDateTime(order.updatedAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-gray-800 dark:text-white/90">{order.customerName}</p>
                      <p className="text-xs text-gray-400 font-mono truncate max-w-[140px]">{order.id}...</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-800 dark:text-white/90">{fmtMoney(order.totalAmount)}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center whitespace-nowrap">{order.itemsCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <DeliveryBadge method={order.deliveryMethod} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {order.scheduledAt ? (
                        <div className="flex items-start gap-1.5 text-gray-600 dark:text-gray-300">
                          <span className="mt-0.5 text-gray-400 flex-shrink-0"><CalendarIcon /></span>
                          <div>
                            <div className="text-xs font-mono">{order.scheduledAt.split(" ").slice(0,1).join(" ")}</div>
                            <div className="text-xs font-mono text-gray-400">{order.scheduledAt.split(" ").slice(1).join(" ")}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">— არ არის</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge label={order.orderStatus} cls={ORDER_STATUS_CLS[order.orderStatus]} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <StatusBadge label={order.deliveryStatus} cls={DELIVERY_STATUS_CLS[order.deliveryStatus]} />
                        <ChevronDownIcon cls={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded === order.id ? "rotate-180" : ""}`} />
                      </div>
                    </td>
                  </tr>
                  {expanded === order.id && <ExpandedRow key={`${order.id}-exp`} order={order} />}
                </>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    შეკვეთები არ მოიძებნა
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={safePage}
        totalPages={totalPages}
        total={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        itemLabel="შეკვეთა"
      />
    </div>
  );
}
