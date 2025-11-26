import { useLoaderData, Form, redirect, useNavigation } from "react-router";
import { Plus, Trash2, ShoppingBag, TicketPercent, Lock, CheckCircle } from "lucide-react";
import sql from "../api/utils/sql";

// --- BACKEND: Securitate & Date ---
export async function loader({ request }) {
  // 1. Verificăm utilizatorul
  const cookieHeader = request.headers.get("Cookie");
  const userIdMatch = cookieHeader?.match(/user_id=([^;]+)/);
  const userId = userIdMatch ? userIdMatch[1] : null;

  if (!userId) return redirect("/login");

  // 2. Verificăm dacă e ADMIN
  const user = await sql`SELECT is_admin FROM users WHERE id = ${userId}`;
  if (!user[0] || !user[0].is_admin) {
    return redirect("/dashboard"); // Îl dăm afară dacă nu e admin
  }

  // 3. Luăm datele existente (ca să le putem șterge)
  const products = await sql`SELECT * FROM products ORDER BY id DESC`;
  const coupons = await sql`SELECT * FROM coupons ORDER BY id DESC`;

  return { products, coupons };
}

export async function action({ request }) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  // --- ADĂUGARE PRODUS ---
  if (intent === "add_product") {
    const title = formData.get("title");
    const price = formData.get("price");
    const old_price = formData.get("old_price");
    const image_url = formData.get("image_url");
    const affiliate_link = formData.get("affiliate_link");
    const category = formData.get("category");
    const is_daily_deal = formData.get("is_daily_deal") === "on"; // Checkbox

    // Dacă e Daily Deal, le resetăm pe celelalte
    if (is_daily_deal) {
        await sql`UPDATE products SET is_daily_deal = FALSE`;
    }

    await sql`
      INSERT INTO products (title, price, old_price, image_url, affiliate_link, category, is_daily_deal)
      VALUES (${title}, ${price}, ${old_price}, ${image_url}, ${affiliate_link}, ${category}, ${is_daily_deal})
    `;
  }

  // --- ADĂUGARE CUPON ---
  if (intent === "add_coupon") {
    const store_name = formData.get("store_name");
    const code = formData.get("code");
    const discount_amount = formData.get("discount_amount");
    const description = formData.get("description");
    const link = formData.get("link");
    
    await sql`
      INSERT INTO coupons (store_name, code, discount_amount, description, link)
      VALUES (${store_name}, ${code}, ${discount_amount}, ${description}, ${link})
    `;
  }

  // --- ȘTERGERE ---
  if (intent === "delete_product") {
    await sql`DELETE FROM products WHERE id = ${formData.get("id")}`;
  }
  if (intent === "delete_coupon") {
    await sql`DELETE FROM coupons WHERE id = ${formData.get("id")}`;
  }

  return null;
}

// --- FRONTEND ---
export default function AdminPage() {
  const { products, coupons } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-900 p-6 font-sans text-gray-100 flex justify-center">
      <div className="w-full max-w-5xl">
        
        <div className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Lock className="text-red-500" /> Admin Panel
            </h1>
            <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1 rounded-full border border-red-500/50 uppercase font-bold">
                Authorized Access Only
            </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLOANA 1: SHOP MANAGER */}
            <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-400">
                        <ShoppingBag size={20} /> Add Product
                    </h2>
                    <Form method="post" className="space-y-3">
                        <input type="hidden" name="intent" value="add_product" />
                        <input name="title" placeholder="Product Name" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm focus:border-green-500 outline-none" />
                        <div className="grid grid-cols-2 gap-3">
                            <input name="price" placeholder="Price ($20)" required className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" />
                            <input name="old_price" placeholder="Old Price ($30)" className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" />
                        </div>
                        <input name="image_url" placeholder="Image URL (Amazon JPG)" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" />
                        <input name="affiliate_link" placeholder="Affiliate Link" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" />
                        
                        <div className="flex items-center justify-between">
                            <select name="category" className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
                                <option value="toy">Toy</option>
                                <option value="food">Food</option>
                                <option value="tech">Tech</option>
                                <option value="grooming">Grooming</option>
                            </select>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input type="checkbox" name="is_daily_deal" className="w-4 h-4 accent-red-500" />
                                Is Daily Deal? 🔥
                            </label>
                        </div>

                        <button disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg mt-2">
                            {isSubmitting ? "Adding..." : "Add Product"}
                        </button>
                    </Form>
                </div>

                {/* LISTA PRODUSE EXISTENTE */}
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 max-h-60 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Existing Products</h3>
                    {products.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg mb-1">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <img src={p.image_url} className="w-8 h-8 rounded object-cover bg-white" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate text-white">{p.title}</p>
                                    {p.is_daily_deal && <span className="text-[10px] text-red-400 font-bold">DAILY DEAL</span>}
                                </div>
                            </div>
                            <Form method="post">
                                <input type="hidden" name="intent" value="delete_product" />
                                <input type="hidden" name="id" value={p.id} />
                                <button className="text-gray-500 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                            </Form>
                        </div>
                    ))}
                </div>
            </div>

            {/* COLOANA 2: COUPON MANAGER */}
            <div className="space-y-6">
                <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
                        <TicketPercent size={20} /> Add Coupon
                    </h2>
                    <Form method="post" className="space-y-3">
                        <input type="hidden" name="intent" value="add_coupon" />
                        <div className="grid grid-cols-2 gap-3">
                            <input name="store_name" placeholder="Store (Chewy)" required className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" />
                            <input name="discount_amount" placeholder="Value (20% OFF)" required className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" />
                        </div>
                        <input name="code" placeholder="Code (SAVE20)" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm font-mono text-yellow-400" />
                        <input name="description" placeholder="Description" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" />
                        <input name="link" placeholder="Affiliate Link" required className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm" />

                        <button disabled={isSubmitting} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg mt-2">
                            {isSubmitting ? "Adding..." : "Add Coupon"}
                        </button>
                    </Form>
                </div>

                {/* LISTA CUPOANE EXISTENTE */}
                <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 max-h-60 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Existing Coupons</h3>
                    {coupons.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg mb-1">
                            <div>
                                <p className="text-xs font-bold text-white">{c.store_name} - {c.code}</p>
                                <p className="text-[10px] text-gray-400">{c.discount_amount}</p>
                            </div>
                            <Form method="post">
                                <input type="hidden" name="intent" value="delete_coupon" />
                                <input type="hidden" name="id" value={c.id} />
                                <button className="text-gray-500 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                            </Form>
                        </div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}