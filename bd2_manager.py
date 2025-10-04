#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BD2 Character Manager - Enhanced Version
Tool quản lý nhân vật BD2 với đầy đủ tính năng
"""

import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import json
import os

class BD2Manager:
    def __init__(self, root):
        self.root = root
        self.root.title("BD2 Character Manager - Enhanced")
        self.root.geometry("1600x1000")
        
        # Dữ liệu
        self.data = {"characters": []}
        self.current_character = None
        self.current_costume = None
        
        # Tạo giao diện
        self.create_widgets()
        self.load_data()
        
    def create_widgets(self):
        """Tạo giao diện chính"""
        # Menu bar
        self.create_menu()
        
        # Layout chính - 2 cột
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Cột trái - danh sách
        self.create_left_panel(main_frame)
        
        # Cột phải - thông tin chi tiết
        self.create_right_panel(main_frame)
        
    def create_menu(self):
        """Tạo menu"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Load Data", command=self.load_data)
        file_menu.add_command(label="Save Data", command=self.save_data)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)
        
    def create_left_panel(self, parent):
        """Tạo panel bên trái"""
        left_frame = ttk.Frame(parent, width=350)
        left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=(0, 10))
        left_frame.pack_propagate(False)
        
        # Danh sách nhân vật
        char_frame = ttk.LabelFrame(left_frame, text="Nhân vật", padding=10)
        char_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        self.char_listbox = tk.Listbox(char_frame, height=12)
        self.char_listbox.pack(fill=tk.BOTH, expand=True, pady=(0, 5))
        self.char_listbox.bind('<<ListboxSelect>>', self.on_char_select)
        
        char_btn_frame = ttk.Frame(char_frame)
        char_btn_frame.pack(fill=tk.X)
        ttk.Button(char_btn_frame, text="Thêm", command=self.add_character).pack(side=tk.LEFT, padx=2)
        ttk.Button(char_btn_frame, text="Sửa", command=self.edit_character).pack(side=tk.LEFT, padx=2)
        ttk.Button(char_btn_frame, text="Xóa", command=self.delete_character).pack(side=tk.LEFT, padx=2)
        
        # Danh sách costume
        costume_frame = ttk.LabelFrame(left_frame, text="Costume", padding=10)
        costume_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        self.costume_listbox = tk.Listbox(costume_frame, height=8)
        self.costume_listbox.pack(fill=tk.BOTH, expand=True, pady=(0, 5))
        self.costume_listbox.bind('<<ListboxSelect>>', self.on_costume_select)
        
        costume_btn_frame = ttk.Frame(costume_frame)
        costume_btn_frame.pack(fill=tk.X)
        ttk.Button(costume_btn_frame, text="Thêm", command=self.add_costume).pack(side=tk.LEFT, padx=2)
        ttk.Button(costume_btn_frame, text="Sửa", command=self.edit_costume).pack(side=tk.LEFT, padx=2)
        ttk.Button(costume_btn_frame, text="Xóa", command=self.delete_costume).pack(side=tk.LEFT, padx=2)
        
        # Nút lưu
        ttk.Button(left_frame, text="💾 Lưu dữ liệu", command=self.save_data).pack(fill=tk.X, pady=5)
        
    def create_right_panel(self, parent):
        """Tạo panel bên phải"""
        right_frame = ttk.Frame(parent)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Notebook cho các tab
        self.notebook = ttk.Notebook(right_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True)
        
        # Tab thông tin cơ bản
        self.create_basic_tab()
        
        # Tab thông số
        self.create_stats_tab()
        
        # Tab skill
        self.create_skill_tab()
        
        # Tab gear & bonus
        self.create_gear_tab()
        
    def create_basic_tab(self):
        """Tạo tab thông tin cơ bản"""
        basic_frame = ttk.Frame(self.notebook)
        self.notebook.add(basic_frame, text="Thông tin cơ bản")
        
        # Tạo form với scrollbar
        canvas = tk.Canvas(basic_frame)
        scrollbar = ttk.Scrollbar(basic_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # Thông tin nhân vật
        char_info_frame = ttk.LabelFrame(scrollable_frame, text="Thông tin nhân vật", padding=10)
        char_info_frame.pack(fill=tk.X, pady=5)
        
        self.basic_fields = {}
        basic_fields = [
            ("ID:", "id"),
            ("Path:", "path"), 
            ("Tên:", "name"),
            ("Thuộc tính:", "attribute"),
            ("Loại tấn công:", "atkType"),
            ("Giới tính:", "gender"),
            ("Sao:", "star")
        ]
        
        for i, (label, field) in enumerate(basic_fields):
            ttk.Label(char_info_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            
            if field in ["attribute", "atkType", "gender"]:
                if field == "attribute":
                    values = ["Fire", "Water", "Earth", "Light", "Dark"]
                elif field == "atkType":
                    values = ["Physical", "Magical"]
                elif field == "gender":
                    values = ["Male", "Female"]
                entry = ttk.Combobox(char_info_frame, values=values, width=30)
            elif field == "star":
                entry = ttk.Combobox(char_info_frame, values=[3, 4, 5], width=30)
            else:
                entry = ttk.Entry(char_info_frame, width=30)
                
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.basic_fields[field] = entry
            
        # Thông tin costume
        costume_info_frame = ttk.LabelFrame(scrollable_frame, text="Thông tin costume", padding=10)
        costume_info_frame.pack(fill=tk.X, pady=5)
        
        self.costume_fields = {}
        costume_fields = [
            ("ID:", "id"),
            ("Path:", "path"),
            ("Tên:", "name"),
            ("Image URL:", "image_url")
        ]
        
        for i, (label, field) in enumerate(costume_fields):
            ttk.Label(costume_info_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            entry = ttk.Entry(costume_info_frame, width=30)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.costume_fields[field] = entry
            
        # Skin info
        skin_info_frame = ttk.LabelFrame(scrollable_frame, text="Skin", padding=10)
        skin_info_frame.pack(fill=tk.X, pady=5)
        
        self.skin_listbox = tk.Listbox(skin_info_frame, height=4)
        self.skin_listbox.pack(fill=tk.X, pady=(0, 5))
        
        skin_btn_frame = ttk.Frame(skin_info_frame)
        skin_btn_frame.pack(fill=tk.X)
        ttk.Button(skin_btn_frame, text="Thêm skin", command=self.add_skin).pack(side=tk.LEFT, padx=2)
        ttk.Button(skin_btn_frame, text="Sửa skin", command=self.edit_skin).pack(side=tk.LEFT, padx=2)
        ttk.Button(skin_btn_frame, text="Xóa skin", command=self.delete_skin).pack(side=tk.LEFT, padx=2)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
    def create_stats_tab(self):
        """Tạo tab thông số"""
        stats_frame = ttk.Frame(self.notebook)
        self.notebook.add(stats_frame, text="Thông số")
        
        # Max level stats
        max_frame = ttk.LabelFrame(stats_frame, text="Thông số cấp tối đa", padding=10)
        max_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.max_stats = {}
        max_fields = ["ATK", "CR", "CRDM", "HP", "DEF", "MRES"]
        for i, field in enumerate(max_fields):
            ttk.Label(max_frame, text=f"{field}:").grid(row=0, column=i*2, padx=5, pady=2)
            entry = ttk.Entry(max_frame, width=10)
            entry.grid(row=0, column=i*2+1, padx=5, pady=2)
            self.max_stats[field] = entry
            
        # Engraving stats
        engraving_frame = ttk.LabelFrame(stats_frame, text="Thông số khắc", padding=10)
        engraving_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.engraving_stats = {}
        engraving_fields = ["HP", "ATK", "MATK", "DEF", "MRES"]
        for i, field in enumerate(engraving_fields):
            ttk.Label(engraving_frame, text=f"{field}:").grid(row=0, column=i*2, padx=5, pady=2)
            entry = ttk.Entry(engraving_frame, width=10)
            entry.grid(row=0, column=i*2+1, padx=5, pady=2)
            self.engraving_stats[field] = entry
            
        # Awakening stats
        awakening_frame = ttk.LabelFrame(stats_frame, text="Thông số thức tỉnh", padding=10)
        awakening_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.awakening_stats = {}
        awakening_fields = ["ATK", "MATK", "FIRE_DAMAGE", "WATER_DAMAGE", "EARTH_DAMAGE", "LIGHT_DAMAGE", "DARK_DAMAGE"]
        for i, field in enumerate(awakening_fields):
            ttk.Label(awakening_frame, text=f"{field}:").grid(row=0, column=i*2, padx=5, pady=2)
            entry = ttk.Entry(awakening_frame, width=10)
            entry.grid(row=0, column=i*2+1, padx=5, pady=2)
            self.awakening_stats[field] = entry
            
        # Permanent & Bonding
        bonus_frame = ttk.LabelFrame(stats_frame, text="Permanent & Bonding", padding=10)
        bonus_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.permanent_stats = {}
        self.bonding_stats = {}
        
        # Permanent
        ttk.Label(bonus_frame, text="Permanent:").grid(row=0, column=0, padx=5, pady=2)
        permanent_fields = ["ATK", "MATK", "HP", "DEF", "MRES"]
        for i, field in enumerate(permanent_fields):
            ttk.Label(bonus_frame, text=f"{field}:").grid(row=1, column=i*2, padx=5, pady=2)
            entry = ttk.Entry(bonus_frame, width=10)
            entry.grid(row=1, column=i*2+1, padx=5, pady=2)
            self.permanent_stats[field] = entry
            
        # Bonding
        ttk.Label(bonus_frame, text="Bonding:").grid(row=2, column=0, padx=5, pady=2)
        bonding_fields = ["ATK", "MATK", "HP", "DEF", "MRES"]
        for i, field in enumerate(bonding_fields):
            ttk.Label(bonus_frame, text=f"{field}:").grid(row=3, column=i*2, padx=5, pady=2)
            entry = ttk.Entry(bonus_frame, width=10)
            entry.grid(row=3, column=i*2+1, padx=5, pady=2)
            self.bonding_stats[field] = entry
            
        # Nút lưu
        ttk.Button(stats_frame, text="💾 Lưu thông số", command=self.save_stats).pack(pady=20)
        
    def create_skill_tab(self):
        """Tạo tab skill"""
        skill_frame = ttk.Frame(self.notebook)
        self.notebook.add(skill_frame, text="Skill")
        
        # Thông tin skill cơ bản
        basic_skill_frame = ttk.LabelFrame(skill_frame, text="Thông tin skill", padding=10)
        basic_skill_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.skill_fields = {}
        skill_fields = [
            ("Tên skill:", "name"),
            ("Chain:", "chain"),
            ("Preview:", "preview")
        ]
        
        for i, (label, field) in enumerate(skill_fields):
            ttk.Label(basic_skill_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            if field == "preview":
                entry = scrolledtext.ScrolledText(basic_skill_frame, height=3, width=50)
            else:
                entry = ttk.Entry(basic_skill_frame, width=50)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.skill_fields[field] = entry
            
        # Base skill description
        ttk.Label(basic_skill_frame, text="Mô tả skill:").grid(row=3, column=0, sticky=tk.NW, padx=5, pady=2)
        self.skill_fields["base_skill"] = scrolledtext.ScrolledText(basic_skill_frame, height=4, width=50)
        self.skill_fields["base_skill"].grid(row=3, column=1, sticky=tk.W, padx=5, pady=2)
        
        # Skill levels
        levels_frame = ttk.LabelFrame(skill_frame, text="Skill Levels", padding=10)
        levels_frame.pack(fill=tk.BOTH, expand=True, pady=5, padx=10)
        
        # Treeview cho skill levels
        columns = ("Level", "VALUE1", "VALUE2", "VALUE3", "SP", "CD")
        self.skill_tree = ttk.Treeview(levels_frame, columns=columns, show="headings", height=6)
        
        for col in columns:
            self.skill_tree.heading(col, text=col)
            self.skill_tree.column(col, width=80)
            
        self.skill_tree.pack(fill=tk.BOTH, expand=True, pady=(0, 5))
        
        # Buttons cho skill levels
        level_btn_frame = ttk.Frame(levels_frame)
        level_btn_frame.pack(fill=tk.X)
        ttk.Button(level_btn_frame, text="Thêm level", command=self.add_skill_level).pack(side=tk.LEFT, padx=2)
        ttk.Button(level_btn_frame, text="Sửa level", command=self.edit_skill_level).pack(side=tk.LEFT, padx=2)
        ttk.Button(level_btn_frame, text="Xóa level", command=self.delete_skill_level).pack(side=tk.LEFT, padx=2)
        
        # Potential
        potential_frame = ttk.LabelFrame(skill_frame, text="Potential", padding=10)
        potential_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.potential_listbox = tk.Listbox(potential_frame, height=3)
        self.potential_listbox.pack(fill=tk.X, pady=(0, 5))
        
        potential_btn_frame = ttk.Frame(potential_frame)
        potential_btn_frame.pack(fill=tk.X)
        ttk.Button(potential_btn_frame, text="Thêm potential", command=self.add_potential).pack(side=tk.LEFT, padx=2)
        ttk.Button(potential_btn_frame, text="Sửa potential", command=self.edit_potential).pack(side=tk.LEFT, padx=2)
        ttk.Button(potential_btn_frame, text="Xóa potential", command=self.delete_potential).pack(side=tk.LEFT, padx=2)
        
    def create_gear_tab(self):
        """Tạo tab gear & bonus"""
        gear_frame = ttk.Frame(self.notebook)
        self.notebook.add(gear_frame, text="Gear & Bonus")
        
        # Exclusive Gear
        gear_info_frame = ttk.LabelFrame(gear_frame, text="Exclusive Gear", padding=10)
        gear_info_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.gear_fields = {}
        gear_fields = [
            ("Tên gear:", "name"),
            ("Icon:", "icon")
        ]
        
        for i, (label, field) in enumerate(gear_fields):
            ttk.Label(gear_info_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            entry = ttk.Entry(gear_info_frame, width=30)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.gear_fields[field] = entry
            
        # Exclusive Ability
        ability_frame = ttk.LabelFrame(gear_frame, text="Exclusive Ability", padding=10)
        ability_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.ability_stats = {}
        ability_fields = ["ATK", "MATK", "HP", "DEF", "MRES"]
        for i, field in enumerate(ability_fields):
            ttk.Label(ability_frame, text=f"{field}:").grid(row=0, column=i*2, padx=5, pady=2)
            entry = ttk.Entry(ability_frame, width=10)
            entry.grid(row=0, column=i*2+1, padx=5, pady=2)
            self.ability_stats[field] = entry
            
        # Basic Stats 1 & 2
        basic_stats_frame = ttk.LabelFrame(gear_frame, text="Basic Stats", padding=10)
        basic_stats_frame.pack(fill=tk.X, pady=5, padx=10)
        
        self.basic_stats_1 = {}
        self.basic_stats_2 = {}
        
        # Basic Stats 1
        ttk.Label(basic_stats_frame, text="Basic Stats 1:").grid(row=0, column=0, padx=5, pady=2)
        for i, field in enumerate(ability_fields):
            ttk.Label(basic_stats_frame, text=f"{field}:").grid(row=1, column=i*2, padx=5, pady=2)
            entry = ttk.Entry(basic_stats_frame, width=10)
            entry.grid(row=1, column=i*2+1, padx=5, pady=2)
            self.basic_stats_1[field] = entry
            
        # Basic Stats 2
        ttk.Label(basic_stats_frame, text="Basic Stats 2:").grid(row=2, column=0, padx=5, pady=2)
        for i, field in enumerate(ability_fields):
            ttk.Label(basic_stats_frame, text=f"{field}:").grid(row=3, column=i*2, padx=5, pady=2)
            entry = ttk.Entry(basic_stats_frame, width=10)
            entry.grid(row=3, column=i*2+1, padx=5, pady=2)
            self.basic_stats_2[field] = entry
            
        # HP_1 và HP_2 cho Basic Stats 2
        ttk.Label(basic_stats_frame, text="HP_1:").grid(row=4, column=0, padx=5, pady=2)
        self.hp_1_entry = ttk.Entry(basic_stats_frame, width=10)
        self.hp_1_entry.grid(row=4, column=1, padx=5, pady=2)
        
        ttk.Label(basic_stats_frame, text="HP_2:").grid(row=4, column=2, padx=5, pady=2)
        self.hp_2_entry = ttk.Entry(basic_stats_frame, width=10)
        self.hp_2_entry.grid(row=4, column=3, padx=5, pady=2)
        
    # ========== DATA LOADING & SAVING ==========
    
    def load_data(self):
        """Tải dữ liệu từ file JSON"""
        try:
            file_path = "public/data/characters.json"
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
                self.refresh_character_list()
                messagebox.showinfo("Thành công", "Đã tải dữ liệu thành công!")
            else:
                messagebox.showerror("Lỗi", f"Không tìm thấy file {file_path}")
        except Exception as e:
            messagebox.showerror("Lỗi", f"Lỗi khi tải dữ liệu: {str(e)}")
            
    def save_data(self):
        """Lưu dữ liệu vào file JSON"""
        try:
            file_path = "public/data/characters.json"
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=4)
            messagebox.showinfo("Thành công", "Đã lưu dữ liệu thành công!")
        except Exception as e:
            messagebox.showerror("Lỗi", f"Lỗi khi lưu dữ liệu: {str(e)}")
            
    def refresh_character_list(self):
        """Làm mới danh sách nhân vật"""
        self.char_listbox.delete(0, tk.END)
        for char in self.data.get("characters", []):
            self.char_listbox.insert(tk.END, f"{char.get('name', 'Unknown')} ({char.get('id', 'No ID')})")
            
    def refresh_costume_list(self):
        """Làm mới danh sách costume"""
        self.costume_listbox.delete(0, tk.END)
        if self.current_character and "costumes" in self.current_character:
            for costume in self.current_character["costumes"]:
                self.costume_listbox.insert(tk.END, f"{costume.get('name', 'Unknown')} ({costume.get('id', 'No ID')})")
                
    def refresh_skin_list(self):
        """Làm mới danh sách skin"""
        self.skin_listbox.delete(0, tk.END)
        if self.current_costume and "skin" in self.current_costume:
            for skin in self.current_costume["skin"]:
                self.skin_listbox.insert(tk.END, skin.get("name", "Unknown"))
                
    # ========== EVENT HANDLERS ==========
    
    def on_char_select(self, event):
        """Xử lý khi chọn nhân vật"""
        selection = self.char_listbox.curselection()
        if selection:
            index = selection[0]
            self.current_character = self.data["characters"][index]
            self.current_costume = None
            self.load_character_data()
            self.refresh_costume_list()
            self.clear_costume_data()
            
    def on_costume_select(self, event):
        """Xử lý khi chọn costume"""
        if not self.current_character:
            return
            
        selection = self.costume_listbox.curselection()
        if selection:
            index = selection[0]
            self.current_costume = self.current_character["costumes"][index]
            self.load_costume_data()
            self.refresh_skin_list()
            
    def load_character_data(self):
        """Tải dữ liệu nhân vật vào form"""
        if not self.current_character:
            return
            
        char = self.current_character
        
        # Thông tin cơ bản
        for field, entry in self.basic_fields.items():
            if isinstance(entry, ttk.Entry):
                entry.delete(0, tk.END)
                entry.insert(0, str(char.get(field, "")))
            elif isinstance(entry, ttk.Combobox):
                entry.set(str(char.get(field, "")))
                
        # Thông số
        self.load_stats_data(char)
        
        # Skill
        self.load_skill_data()
        
        # Gear
        self.load_gear_data(char)
        
    def load_costume_data(self):
        """Tải dữ liệu costume vào form"""
        if not self.current_costume:
            return
            
        costume = self.current_costume
        for field, entry in self.costume_fields.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(costume.get(field, "")))
            
    def load_stats_data(self, char):
        """Tải dữ liệu thông số"""
        # Max level stats
        max_stats = char.get("maxlevel", {})
        for field, entry in self.max_stats.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(max_stats.get(field, "")))
            
        # Engraving stats
        engraving = char.get("engraving", {})
        for field, entry in self.engraving_stats.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(engraving.get(field, "")))
            
        # Awakening stats
        awakening = char.get("awakening", {})
        for field, entry in self.awakening_stats.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(awakening.get(field, "")))
            
    def load_skill_data(self):
        """Tải dữ liệu skill"""
        if not self.current_costume or "skill" not in self.current_costume:
            return
            
        skill = self.current_costume["skill"]
        
        # Thông tin skill cơ bản
        for field, entry in self.skill_fields.items():
            if field == "base_skill":
                entry.delete(1.0, tk.END)
                entry.insert(1.0, skill.get(field, ""))
            elif field == "preview":
                entry.delete(1.0, tk.END)
                entry.insert(1.0, skill.get(field, ""))
            else:
                entry.delete(0, tk.END)
                entry.insert(0, str(skill.get(field, "")))
                
        # Skill levels
        self.load_skill_levels(skill.get("levels", []))
        
        # Potential
        self.load_potential(skill.get("potential", []))
        
    def load_skill_levels(self, levels):
        """Tải danh sách skill levels"""
        for item in self.skill_tree.get_children():
            self.skill_tree.delete(item)
            
        for i, level in enumerate(levels):
            values = (
                i + 1,
                level.get("VALUE1", ""),
                level.get("VALUE2", ""),
                level.get("VALUE3", ""),
                level.get("sp", ""),
                level.get("cd", "")
            )
            self.skill_tree.insert("", "end", values=values)
            
    def load_potential(self, potential):
        """Tải danh sách potential"""
        self.potential_listbox.delete(0, tk.END)
        for pot in potential:
            pot_text = f"{pot.get('type', '')}: {pot.get('value', '')}"
            self.potential_listbox.insert(tk.END, pot_text)
            
    def load_gear_data(self, char):
        """Tải dữ liệu gear"""
        gear = char.get("exclusive_gear", {})
        
        # Thông tin gear cơ bản
        for field, entry in self.gear_fields.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(gear.get(field, "")))
            
        # Exclusive Ability
        ability = gear.get("Exclusive Ability", {})
        for field, entry in self.ability_stats.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(ability.get(field, "")))
            
        # Basic Stats 1
        basic_1 = gear.get("basic_stats_1", {})
        for field, entry in self.basic_stats_1.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(basic_1.get(field, "")))
            
        # Basic Stats 2
        basic_2 = gear.get("basic_stats_2", {})
        for field, entry in self.basic_stats_2.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(basic_2.get(field, "")))
            
        # HP_1 và HP_2
        self.hp_1_entry.delete(0, tk.END)
        self.hp_1_entry.insert(0, str(basic_2.get("HP_1", "")))
        
        self.hp_2_entry.delete(0, tk.END)
        self.hp_2_entry.insert(0, str(basic_2.get("HP_2", "")))
        
    def clear_costume_data(self):
        """Xóa dữ liệu costume"""
        for field in self.costume_fields.values():
            field.delete(0, tk.END)
        self.skin_listbox.delete(0, tk.END)
        
    # ========== CRUD OPERATIONS ==========
    
    def add_character(self):
        """Thêm nhân vật mới"""
        dialog = CharacterDialog(self.root, "Thêm nhân vật mới")
        if dialog.result:
            self.data["characters"].append(dialog.result)
            self.refresh_character_list()
            
    def edit_character(self):
        """Sửa nhân vật"""
        if not self.current_character:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn nhân vật cần sửa!")
            return
            
        dialog = CharacterDialog(self.root, "Sửa nhân vật", self.current_character)
        if dialog.result:
            char_index = self.data["characters"].index(self.current_character)
            self.data["characters"][char_index] = dialog.result
            self.current_character = dialog.result
            self.refresh_character_list()
            self.load_character_data()
            
    def delete_character(self):
        """Xóa nhân vật"""
        if not self.current_character:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn nhân vật cần xóa!")
            return
            
        if messagebox.askyesno("Xác nhận", f"Bạn có chắc muốn xóa nhân vật {self.current_character.get('name', 'Unknown')}?"):
            self.data["characters"].remove(self.current_character)
            self.current_character = None
            self.current_costume = None
            self.refresh_character_list()
            self.refresh_costume_list()
            self.clear_costume_data()
            
    def add_costume(self):
        """Thêm costume mới"""
        if not self.current_character:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn nhân vật trước!")
            return
            
        dialog = CostumeDialog(self.root, "Thêm costume mới")
        if dialog.result:
            if "costumes" not in self.current_character:
                self.current_character["costumes"] = []
            self.current_character["costumes"].append(dialog.result)
            self.refresh_costume_list()
            
    def edit_costume(self):
        """Sửa costume"""
        if not self.current_costume:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn costume cần sửa!")
            return
            
        dialog = CostumeDialog(self.root, "Sửa costume", self.current_costume)
        if dialog.result:
            costume_index = self.current_character["costumes"].index(self.current_costume)
            self.current_character["costumes"][costume_index] = dialog.result
            self.current_costume = dialog.result
            self.refresh_costume_list()
            self.load_costume_data()
            
    def delete_costume(self):
        """Xóa costume"""
        if not self.current_costume:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn costume cần xóa!")
            return
            
        if messagebox.askyesno("Xác nhận", f"Bạn có chắc muốn xóa costume {self.current_costume.get('name', 'Unknown')}?"):
            self.current_character["costumes"].remove(self.current_costume)
            self.current_costume = None
            self.refresh_costume_list()
            self.clear_costume_data()
            
    def add_skin(self):
        """Thêm skin mới"""
        if not self.current_costume:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn costume trước!")
            return
            
        dialog = SkinDialog(self.root, "Thêm skin mới")
        if dialog.result:
            if "skin" not in self.current_costume:
                self.current_costume["skin"] = []
            self.current_costume["skin"].append(dialog.result)
            self.refresh_skin_list()
            
    def edit_skin(self):
        """Sửa skin"""
        if not self.current_costume or not self.current_costume.get("skin"):
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn skin cần sửa!")
            return
            
        selection = self.skin_listbox.curselection()
        if not selection:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn skin cần sửa!")
            return
            
        index = selection[0]
        current_skin = self.current_costume["skin"][index]
        
        dialog = SkinDialog(self.root, "Sửa skin", current_skin)
        if dialog.result:
            self.current_costume["skin"][index] = dialog.result
            self.refresh_skin_list()
            
    def delete_skin(self):
        """Xóa skin"""
        if not self.current_costume or not self.current_costume.get("skin"):
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn skin cần xóa!")
            return
            
        selection = self.skin_listbox.curselection()
        if not selection:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn skin cần xóa!")
            return
            
        index = selection[0]
        skin = self.current_costume["skin"][index]
        
        if messagebox.askyesno("Xác nhận", f"Bạn có chắc muốn xóa skin {skin.get('name', 'Unknown')}?"):
            self.current_costume["skin"].pop(index)
            self.refresh_skin_list()
            
    def save_stats(self):
        """Lưu thông số"""
        if not self.current_character:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn nhân vật!")
            return
            
        char = self.current_character
        
        # Cập nhật max level stats
        if "maxlevel" not in char:
            char["maxlevel"] = {}
        for field, entry in self.max_stats.items():
            value = entry.get()
            if value:
                try:
                    char["maxlevel"][field] = int(value)
                except ValueError:
                    char["maxlevel"][field] = float(value)
                    
        # Cập nhật engraving stats
        if "engraving" not in char:
            char["engraving"] = {}
        for field, entry in self.engraving_stats.items():
            value = entry.get()
            if value:
                try:
                    char["engraving"][field] = int(value)
                except ValueError:
                    char["engraving"][field] = float(value)
                    
        # Cập nhật awakening stats
        if "awakening" not in char:
            char["awakening"] = {}
        for field, entry in self.awakening_stats.items():
            value = entry.get()
            if value:
                try:
                    char["awakening"][field] = int(value)
                except ValueError:
                    char["awakening"][field] = float(value)
                    
        messagebox.showinfo("Thành công", "Đã lưu thông số thành công!")
        
    # ========== SKILL LEVEL OPERATIONS ==========
    
    def add_skill_level(self):
        """Thêm skill level mới"""
        if not self.current_costume:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn costume trước!")
            return
            
        dialog = SkillLevelDialog(self.root, "Thêm skill level mới")
        if dialog.result:
            if "skill" not in self.current_costume:
                self.current_costume["skill"] = {"levels": []}
            if "levels" not in self.current_costume["skill"]:
                self.current_costume["skill"]["levels"] = []
            self.current_costume["skill"]["levels"].append(dialog.result)
            self.load_skill_levels(self.current_costume["skill"]["levels"])
            
    def edit_skill_level(self):
        """Sửa skill level"""
        if not self.current_costume or not self.current_costume.get("skill", {}).get("levels"):
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn skill level cần sửa!")
            return
            
        selection = self.skill_tree.selection()
        if not selection:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn skill level cần sửa!")
            return
            
        item = self.skill_tree.item(selection[0])
        level_index = int(item['values'][0]) - 1
        
        current_level = self.current_costume["skill"]["levels"][level_index]
        
        dialog = SkillLevelDialog(self.root, "Sửa skill level", current_level)
        if dialog.result:
            self.current_costume["skill"]["levels"][level_index] = dialog.result
            self.load_skill_levels(self.current_costume["skill"]["levels"])
            
    def delete_skill_level(self):
        """Xóa skill level"""
        if not self.current_costume or not self.current_costume.get("skill", {}).get("levels"):
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn skill level cần xóa!")
            return
            
        selection = self.skill_tree.selection()
        if not selection:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn skill level cần xóa!")
            return
            
        item = self.skill_tree.item(selection[0])
        level_index = int(item['values'][0]) - 1
        
        if messagebox.askyesno("Xác nhận", f"Bạn có chắc muốn xóa skill level {level_index + 1}?"):
            self.current_costume["skill"]["levels"].pop(level_index)
            self.load_skill_levels(self.current_costume["skill"]["levels"])
            
    def add_potential(self):
        """Thêm potential mới"""
        if not self.current_costume:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn costume trước!")
            return
            
        dialog = PotentialDialog(self.root, "Thêm potential mới")
        if dialog.result:
            if "skill" not in self.current_costume:
                self.current_costume["skill"] = {"potential": []}
            if "potential" not in self.current_costume["skill"]:
                self.current_costume["skill"]["potential"] = []
            self.current_costume["skill"]["potential"].append(dialog.result)
            self.load_potential(self.current_costume["skill"]["potential"])
            
    def edit_potential(self):
        """Sửa potential"""
        if not self.current_costume or not self.current_costume.get("skill", {}).get("potential"):
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn potential cần sửa!")
            return
            
        selection = self.potential_listbox.curselection()
        if not selection:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn potential cần sửa!")
            return
            
        index = selection[0]
        current_potential = self.current_costume["skill"]["potential"][index]
        
        dialog = PotentialDialog(self.root, "Sửa potential", current_potential)
        if dialog.result:
            self.current_costume["skill"]["potential"][index] = dialog.result
            self.load_potential(self.current_costume["skill"]["potential"])
            
    def delete_potential(self):
        """Xóa potential"""
        if not self.current_costume or not self.current_costume.get("skill", {}).get("potential"):
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn potential cần xóa!")
            return
            
        selection = self.potential_listbox.curselection()
        if not selection:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn potential cần xóa!")
            return
            
        index = selection[0]
        potential = self.current_costume["skill"]["potential"][index]
        
        if messagebox.askyesno("Xác nhận", f"Bạn có chắc muốn xóa potential {potential.get('type', 'Unknown')}?"):
            self.current_costume["skill"]["potential"].pop(index)
            self.load_potential(self.current_costume["skill"]["potential"])


# ========== DIALOG CLASSES ==========

class CharacterDialog:
    def __init__(self, parent, title, character=None):
        self.result = None
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("500x400")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        self.create_form(character)
        
        # Center dialog
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.dialog.wait_window()
        
    def create_form(self, character):
        main_frame = ttk.Frame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        fields = [
            ("ID:", "id"),
            ("Path:", "path"),
            ("Tên:", "name"),
            ("Thuộc tính:", "attribute"),
            ("Loại tấn công:", "atkType"),
            ("Giới tính:", "gender"),
            ("Sao:", "star")
        ]
        
        self.fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(main_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=5)
            
            if field in ["attribute", "atkType", "gender"]:
                if field == "attribute":
                    values = ["Fire", "Water", "Earth", "Light", "Dark"]
                elif field == "atkType":
                    values = ["Physical", "Magical"]
                elif field == "gender":
                    values = ["Male", "Female"]
                entry = ttk.Combobox(main_frame, values=values, width=30)
            elif field == "star":
                entry = ttk.Combobox(main_frame, values=[3, 4, 5], width=30)
            else:
                entry = ttk.Entry(main_frame, width=30)
                
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=5)
            self.fields[field] = entry
            
        if character:
            for field, entry in self.fields.items():
                if isinstance(entry, ttk.Entry):
                    entry.insert(0, str(character.get(field, "")))
                else:
                    entry.set(str(character.get(field, "")))
                    
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=len(fields), column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="OK", command=self.ok_clicked).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel_clicked).pack(side=tk.LEFT, padx=5)
        
    def ok_clicked(self):
        char_data = {
            "id": self.fields["id"].get(),
            "path": self.fields["path"].get(),
            "name": self.fields["name"].get(),
            "attribute": self.fields["attribute"].get(),
            "atkType": self.fields["atkType"].get(),
            "gender": self.fields["gender"].get(),
            "star": int(self.fields["star"].get()) if self.fields["star"].get() else 5,
            "costumes": []
        }
        
        # Thêm các trường mặc định
        char_data["maxlevel"] = {"ATK": 0, "CR": 0, "CRDM": 0, "HP": 0, "DEF": 0, "MRES": 0}
        char_data["engraving"] = {"HP": 0, "ATK": 0, "MATK": 0, "DEF": 0, "MRES": 0}
        char_data["awakening"] = {"ATK": 0, "MATK": 0}
        char_data["exclusive_gear"] = {
            "name": "",
            "icon": "",
            "Exclusive Ability": {},
            "basic_stats_1": {},
            "basic_stats_2": {}
        }
        
        self.result = char_data
        self.dialog.destroy()
        
    def cancel_clicked(self):
        self.dialog.destroy()


class CostumeDialog:
    def __init__(self, parent, title, costume=None):
        self.result = None
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x300")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        self.create_form(costume)
        
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.dialog.wait_window()
        
    def create_form(self, costume):
        main_frame = ttk.Frame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        fields = [
            ("ID:", "id"),
            ("Path:", "path"),
            ("Tên:", "name"),
            ("Image URL:", "image_url")
        ]
        
        self.fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(main_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=5)
            entry = ttk.Entry(main_frame, width=30)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=5)
            self.fields[field] = entry
            
        if costume:
            for field, entry in self.fields.items():
                entry.insert(0, str(costume.get(field, "")))
                
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=len(fields), column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="OK", command=self.ok_clicked).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel_clicked).pack(side=tk.LEFT, padx=5)
        
    def ok_clicked(self):
        costume_data = {
            "id": self.fields["id"].get(),
            "path": self.fields["path"].get(),
            "name": self.fields["name"].get(),
            "image_url": self.fields["image_url"].get(),
            "skin": [],
            "skill": {
                "name": "",
                "base_skill": "",
                "chain": 0,
                "levels": [],
                "potential": [],
                "preview": ""
            }
        }
        
        self.result = costume_data
        self.dialog.destroy()
        
    def cancel_clicked(self):
        self.dialog.destroy()


class SkinDialog:
    def __init__(self, parent, title, skin=None):
        self.result = None
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x200")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        self.create_form(skin)
        
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.dialog.wait_window()
        
    def create_form(self, skin):
        main_frame = ttk.Frame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        fields = [
            ("Tên:", "name"),
            ("Image URL:", "image_url")
        ]
        
        self.fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(main_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=5)
            entry = ttk.Entry(main_frame, width=30)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=5)
            self.fields[field] = entry
            
        if skin:
            for field, entry in self.fields.items():
                entry.insert(0, str(skin.get(field, "")))
                
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=len(fields), column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="OK", command=self.ok_clicked).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel_clicked).pack(side=tk.LEFT, padx=5)
        
    def ok_clicked(self):
        skin_data = {
            "name": self.fields["name"].get(),
            "image_url": self.fields["image_url"].get(),
            "spine_data": []
        }
        
        self.result = skin_data
        self.dialog.destroy()
        
    def cancel_clicked(self):
        self.dialog.destroy()


class SkillLevelDialog:
    def __init__(self, parent, title, level=None):
        self.result = None
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x300")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        self.create_form(level)
        
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.dialog.wait_window()
        
    def create_form(self, level):
        main_frame = ttk.Frame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        fields = [
            ("VALUE1:", "VALUE1"),
            ("VALUE2:", "VALUE2"),
            ("VALUE3:", "VALUE3"),
            ("SP:", "sp"),
            ("CD:", "cd")
        ]
        
        self.fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(main_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=5)
            entry = ttk.Entry(main_frame, width=20)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=5)
            self.fields[field] = entry
            
        if level:
            for field, entry in self.fields.items():
                entry.insert(0, str(level.get(field, "")))
                
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=len(fields), column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="OK", command=self.ok_clicked).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel_clicked).pack(side=tk.LEFT, padx=5)
        
    def ok_clicked(self):
        level_data = {}
        for field, entry in self.fields.items():
            value = entry.get()
            if value:
                try:
                    level_data[field] = int(value)
                except ValueError:
                    level_data[field] = float(value)
        
        self.result = level_data
        self.dialog.destroy()
        
    def cancel_clicked(self):
        self.dialog.destroy()


class PotentialDialog:
    def __init__(self, parent, title, potential=None):
        self.result = None
        
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x200")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        self.create_form(potential)
        
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        self.dialog.wait_window()
        
    def create_form(self, potential):
        main_frame = ttk.Frame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        fields = [
            ("Type:", "type"),
            ("Value:", "value")
        ]
        
        self.fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(main_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=5)
            entry = ttk.Entry(main_frame, width=30)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=5)
            self.fields[field] = entry
            
        if potential:
            for field, entry in self.fields.items():
                entry.insert(0, str(potential.get(field, "")))
                
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=len(fields), column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="OK", command=self.ok_clicked).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel_clicked).pack(side=tk.LEFT, padx=5)
        
    def ok_clicked(self):
        potential_data = {
            "type": self.fields["type"].get(),
            "value": self.fields["value"].get()
        }
        
        self.result = potential_data
        self.dialog.destroy()
        
    def cancel_clicked(self):
        self.dialog.destroy()


def main():
    """Hàm main"""
    root = tk.Tk()
    app = BD2Manager(root)
    root.mainloop()


if __name__ == "__main__":
    main()
