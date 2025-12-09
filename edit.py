import json
import os
import shutil
import tkinter as tk
from tkinter import ttk, messagebox, simpledialog, filedialog

# --- Konfigurace cest ---
BASE_DIR = "jeopardy/public"
JSON_DIR = os.path.join(BASE_DIR, "json")
IMG_DIR = os.path.join(BASE_DIR, "images")
AUDIO_DIR = os.path.join(BASE_DIR, "audios")
VIDEO_DIR = os.path.join(BASE_DIR, "videos")

questions_file = os.path.join(JSON_DIR, "questions.json")
answers_file = os.path.join(JSON_DIR, "answers.json")
hints_file = os.path.join(JSON_DIR, "hints.json")

# Vytvoření složek, pokud neexistují
for d in [JSON_DIR, IMG_DIR, AUDIO_DIR, VIDEO_DIR]:
    os.makedirs(d, exist_ok=True)


# --- Načtení dat ---
def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


questions = load_json(questions_file)
answers = load_json(answers_file)
hints = load_json(hints_file)


def save_all():
    def save_file(path, data):
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    save_file(questions_file, questions)
    save_file(answers_file, answers)
    save_file(hints_file, hints)
    messagebox.showinfo("Uloženo", "Všechny změny byly úspěšně uloženy.")


# --- Logika pro média ---
def select_file(media_type):
    """Otevře dialog, zkopíruje soubor a vrátí relativní cestu."""
    filetypes = {
        "image": [("Images", "*.png *.jpg *.jpeg *.gif *.webp")],
        "audio": [("Audio", "*.mp3 *.wav *.ogg")],
        "video": [("Video", "*.mp4 *.webm *.mkv")],
    }
    target_dirs = {"image": IMG_DIR, "audio": AUDIO_DIR, "video": VIDEO_DIR}
    rel_prefixes = {"image": "images/", "audio": "audios/", "video": "videos/"}

    filename = filedialog.askopenfilename(
        title=f"Vyber {media_type}", filetypes=filetypes[media_type]
    )
    if filename:
        # Získat pouze název souboru
        basename = os.path.basename(filename)
        destination = os.path.join(target_dirs[media_type], basename)

        # Kopírování souboru
        try:
            shutil.copy2(filename, destination)
            return f"{rel_prefixes[media_type]}{basename}"
        except Exception as e:
            messagebox.showerror("Chyba", f"Nepodařilo se zkopírovat soubor:\n{e}")
            return None
    return None


def open_media_manager(data_dict, category, val, item_type):
    """
    Otevře okno pro správu médií pro konkrétní položku.
    data_dict: odkaz na slovník (questions, answers, nebo hints)
    item_type: řetězec pro titulek okna (např. 'Otázka', 'Odpověď')
    """
    if category not in data_dict or val not in data_dict[category]:
        # Inicializace pokud neexistuje
        if category not in data_dict:
            data_dict[category] = {}
        if val not in data_dict[category]:
            data_dict[category][val] = {}

    target_obj = data_dict[category][val]

    # Okno
    win = tk.Toplevel(root)
    win.title(f"Média: {category} - ${val} ({item_type})")
    win.geometry("500x300")

    def update_label(lbl, key):
        current = target_obj.get(key)
        text = current if current else "Žádný soubor"
        lbl.config(text=f"{key.upper()}: {text}", fg="blue" if current else "black")

    def handle_change(key, lbl):
        path = select_file(key)
        if path:
            target_obj[key] = path
            update_label(lbl, key)

    def handle_clear(key, lbl):
        target_obj[key] = None
        update_label(lbl, key)

    # Vytvoření řádků pro Image, Audio, Video
    row = 0
    for m_type in ["image", "audio", "video"]:
        frame = tk.Frame(win, pady=10)
        frame.pack(fill="x", padx=10)

        lbl_info = tk.Label(frame, text="...", anchor="w", width=35)
        lbl_info.pack(side="left")
        update_label(lbl_info, m_type)

        btn_clear = tk.Button(
            frame,
            text="Smazat",
            command=lambda k=m_type, l=lbl_info: handle_clear(k, l),
        )
        btn_clear.pack(side="right", padx=5)

        btn_add = tk.Button(
            frame,
            text=f"Nahrát {m_type}",
            command=lambda k=m_type, l=lbl_info: handle_change(k, l),
        )
        btn_add.pack(side="right", padx=5)

        row += 1

    tk.Button(
        win, text="Zavřít (Uložit v paměti)", command=win.destroy, bg="#dddddd"
    ).pack(pady=20)


# --- Úpravy kategorií ---
def edit_category_names():
    top = tk.Toplevel(root)
    top.title("Editovat názvy kategorií")

    def save_renamed_categories():
        new_categories_map = {}
        # Validace a sběr změn
        for i, entry in enumerate(entries):
            old_name = categories[i]
            new_name = entry.get().strip()
            if new_name and new_name != old_name:
                new_categories_map[new_name] = old_name
            elif not new_name:
                messagebox.showwarning("Chyba", "Název kategorie nesmí být prázdný.")
                return

        # Přejmenování v datech
        for new, old in new_categories_map.items():
            if old in questions:
                questions[new] = questions.pop(old)
            if old in answers:
                answers[new] = answers.pop(old)
            if old in hints:
                hints[new] = hints.pop(old)

        save_all()
        refresh_category_list()
        top.destroy()

    categories = list(questions.keys())
    entries = []

    for i, cat in enumerate(categories):
        tk.Label(top, text=f"{i+1}.").grid(row=i, column=0, padx=5, pady=2)
        entry = tk.Entry(top, width=30)
        entry.insert(0, cat)
        entry.grid(row=i, column=1, padx=5, pady=2)
        entries.append(entry)

    tk.Button(top, text="Uložit změny", command=save_renamed_categories).grid(
        row=len(categories), columnspan=2, pady=10
    )


def add_category():
    new_cat = simpledialog.askstring("Nová kategorie", "Zadejte název nové kategorie:")
    if new_cat:
        if new_cat in questions:
            messagebox.showerror("Chyba", "Tato kategorie již existuje.")
            return

        questions[new_cat] = {}
        answers[new_cat] = {}
        hints[new_cat] = {}

        for val in ["100", "200", "300", "400", "500"]:
            questions[new_cat][val] = {
                "question": "",
                "image": None,
                "audio": None,
                "video": None,
            }
            answers[new_cat][val] = {
                "answer": "",
                "image": None,
                "audio": None,
                "video": None,
            }
            hints[new_cat][val] = {
                "hint": "",
                "image": None,
                "audio": None,
                "video": None,
            }

        save_all()
        refresh_category_list()


def delete_category():
    cat = category_var.get()
    if not cat:
        return
    if messagebox.askyesno(
        "Smazat kategorii", f"Opravdu chcete smazat kategorii '{cat}'?"
    ):
        questions.pop(cat, None)
        answers.pop(cat, None)
        hints.pop(cat, None)
        save_all()
        refresh_category_list()


def refresh_category_list():
    categories = list(questions.keys())
    category_menu["menu"].delete(0, "end")
    for cat in categories:
        category_menu["menu"].add_command(
            label=cat, command=tk._setit(category_var, cat, load_category)
        )

    if categories:
        if category_var.get() not in categories:
            category_var.set(categories[0])
        load_category()
    else:
        category_var.set("")
        # Vyčistit pole pokud nejsou kategorie
        for i in range(5):
            question_entries[i].delete(0, tk.END)
            answer_entries[i].delete(0, tk.END)
            hint_entries[i].delete(0, tk.END)


def load_category(*args):
    cat = category_var.get()
    if cat not in questions:
        return
    for i, val in enumerate(["100", "200", "300", "400", "500"]):
        # Load Question Text
        q_text = questions.get(cat, {}).get(val, {}).get("question", "")
        question_entries[i].delete(0, tk.END)
        question_entries[i].insert(0, q_text)

        # Load Answer Text
        a_text = answers.get(cat, {}).get(val, {}).get("answer", "")
        answer_entries[i].delete(0, tk.END)
        answer_entries[i].insert(0, a_text)

        # Load Hint Text
        h_text = hints.get(cat, {}).get(val, {}).get("hint", "")
        hint_entries[i].delete(0, tk.END)
        hint_entries[i].insert(0, h_text)


def save_current_view():
    cat = category_var.get()
    if not cat:
        return

    for i, val in enumerate(["100", "200", "300", "400", "500"]):
        # Uložíme texty z inputů, ale zachováme existující klíče (media)
        if cat not in questions:
            questions[cat] = {}
        if val not in questions[cat]:
            questions[cat][val] = {}
        questions[cat][val]["question"] = question_entries[i].get()

        if cat not in answers:
            answers[cat] = {}
        if val not in answers[cat]:
            answers[cat][val] = {}
        answers[cat][val]["answer"] = answer_entries[i].get()

        if cat not in hints:
            hints[cat] = {}
        if val not in hints[cat]:
            hints[cat][val] = {}
        hints[cat][val]["hint"] = hint_entries[i].get()

    save_all()


# --- GUI setup ---
root = tk.Tk()
root.title("Jeopardy Editor + Media Manager")
root.geometry("1100x400")  # Trochu širší okno kvůli novým tlačítkům

# Category selection
top_frame = tk.Frame(root)
top_frame.pack(pady=10)

category_var = tk.StringVar()
category_menu = ttk.OptionMenu(top_frame, category_var, None)
category_menu.pack(side="left", padx=5)

tk.Button(top_frame, text="Editovat názvy", command=edit_category_names).pack(
    side="left", padx=2
)
tk.Button(top_frame, text="Přidat kategorii", command=add_category).pack(
    side="left", padx=2
)
tk.Button(top_frame, text="Smazat kategorii", command=delete_category).pack(
    side="left", padx=2
)

# Question editor grid
middle_frame = tk.Frame(root)
middle_frame.pack(padx=10, pady=5)

question_entries = []
answer_entries = []
hint_entries = []

# Headers
headers = ["Hodnota", "Otázka", "", "Odpověď", "", "Nápověda", ""]
for col, text in enumerate(headers):
    tk.Label(middle_frame, text=text, font=("Arial", 10, "bold")).grid(
        row=0, column=col, padx=5, pady=5
    )

for i, val in enumerate(["100", "200", "300", "400", "500"]):
    row_idx = i + 1
    tk.Label(middle_frame, text=f"${val}").grid(row=row_idx, column=0)

    # Question
    q_entry = tk.Entry(middle_frame, width=30)
    q_entry.grid(row=row_idx, column=1, padx=2, pady=2)
    question_entries.append(q_entry)
    tk.Button(
        middle_frame,
        text="Média",
        width=6,
        command=lambda v=val: open_media_manager(
            questions, category_var.get(), v, "Otázka"
        ),
    ).grid(row=row_idx, column=2, padx=2)

    # Answer
    a_entry = tk.Entry(middle_frame, width=25)
    a_entry.grid(row=row_idx, column=3, padx=2, pady=2)
    answer_entries.append(a_entry)
    tk.Button(
        middle_frame,
        text="Média",
        width=6,
        command=lambda v=val: open_media_manager(
            answers, category_var.get(), v, "Odpověď"
        ),
    ).grid(row=row_idx, column=4, padx=2)

    # Hint
    h_entry = tk.Entry(middle_frame, width=25)
    h_entry.grid(row=row_idx, column=5, padx=2, pady=2)
    hint_entries.append(h_entry)
    tk.Button(
        middle_frame,
        text="Média",
        width=6,
        command=lambda v=val: open_media_manager(
            hints, category_var.get(), v, "Nápověda"
        ),
    ).grid(row=row_idx, column=6, padx=2)

# Save button
tk.Button(
    root,
    text="ULOŽIT VŠECHNY ZMĚNY",
    command=save_current_view,
    bg="lightblue",
    height=2,
    width=30,
).pack(pady=15)

# Initialize
refresh_category_list()
root.mainloop()
