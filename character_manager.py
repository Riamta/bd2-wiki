#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BD2 Character Manager Tool
Tool để quản lý nhân vật, costume và skin trong game BD2
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog, scrolledtext
import json
import os
from typing import Dict, List, Any, Optional

class CharacterManager:
    def __init__(self, root):
        self.root = root
        self.root.title("BD2 Character Manager - Enhanced")
        self.root.geometry("1400x900")
        
        # Dữ liệu
        self.data = {"characters": []}
        self.current_character = None
        self.current_costume = None
        
        # Tạo giao diện
        self.create_widgets()
        self.load_data()
        
    def create_widgets(self):
        """Tạo giao diện chính"""
        # Frame chính
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Menu bar
        self.create_menu_bar()
        
        # Tạo layout chính với 2 cột
        self.create_main_layout(main_frame)
        
    def create_main_layout(self, parent):
        """Tạo layout chính với 2 cột"""
        # Cột trái - danh sách và điều khiển
        left_frame = ttk.Frame(parent)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=False, padx=(0, 10))
        left_frame.configure(width=400)
        
        # Cột phải - thông tin chi tiết
        right_frame = ttk.Frame(parent)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        # Tạo các phần trong cột trái
        self.create_character_list(left_frame)
        self.create_costume_list(left_frame)
        self.create_control_buttons(left_frame)
        
        # Tạo các phần trong cột phải
        self.create_character_details(right_frame)
        
    def create_menu_bar(self):
        """Tạo menu bar"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Load Data", command=self.load_data)
        file_menu.add_command(label="Save Data", command=self.save_data)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)
        
    def create_character_list(self, parent):
        """Tạo danh sách nhân vật"""
        # Frame cho danh sách nhân vật
        char_frame = ttk.LabelFrame(parent, text="Danh sách nhân vật", padding=10)
        char_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Listbox nhân vật
        self.char_listbox = tk.Listbox(char_frame, height=8)
        self.char_listbox.pack(fill=tk.BOTH, expand=True, pady=(0, 5))
        self.char_listbox.bind('<<ListboxSelect>>', self.on_character_select)
        
        # Buttons cho nhân vật
        char_btn_frame = ttk.Frame(char_frame)
        char_btn_frame.pack(fill=tk.X)
        
        ttk.Button(char_btn_frame, text="Thêm", command=self.add_character, width=8).pack(side=tk.LEFT, padx=2)
        ttk.Button(char_btn_frame, text="Sửa", command=self.edit_character, width=8).pack(side=tk.LEFT, padx=2)
        ttk.Button(char_btn_frame, text="Xóa", command=self.delete_character, width=8).pack(side=tk.LEFT, padx=2)
        
    def create_costume_list(self, parent):
        """Tạo danh sách costume"""
        # Frame cho danh sách costume
        costume_frame = ttk.LabelFrame(parent, text="Danh sách costume", padding=10)
        costume_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Listbox costume
        self.costume_listbox = tk.Listbox(costume_frame, height=6)
        self.costume_listbox.pack(fill=tk.BOTH, expand=True, pady=(0, 5))
        self.costume_listbox.bind('<<ListboxSelect>>', self.on_costume_select)
        
        # Buttons cho costume
        costume_btn_frame = ttk.Frame(costume_frame)
        costume_btn_frame.pack(fill=tk.X)
        
        ttk.Button(costume_btn_frame, text="Thêm", command=self.add_costume, width=8).pack(side=tk.LEFT, padx=2)
        ttk.Button(costume_btn_frame, text="Sửa", command=self.edit_costume, width=8).pack(side=tk.LEFT, padx=2)
        ttk.Button(costume_btn_frame, text="Xóa", command=self.delete_costume, width=8).pack(side=tk.LEFT, padx=2)
        
    def create_control_buttons(self, parent):
        """Tạo các nút điều khiển"""
        control_frame = ttk.Frame(parent)
        control_frame.pack(fill=tk.X, pady=10)
        
        ttk.Button(control_frame, text="Lưu dữ liệu", command=self.save_data).pack(fill=tk.X, pady=2)
        ttk.Button(control_frame, text="Tải lại dữ liệu", command=self.load_data).pack(fill=tk.X, pady=2)
        
    def create_character_details(self, parent):
        """Tạo phần thông tin chi tiết nhân vật"""
        # Tạo notebook cho các tab thông tin
        self.details_notebook = ttk.Notebook(parent)
        self.details_notebook.pack(fill=tk.BOTH, expand=True)
        
        # Tab thông tin cơ bản (nhân vật + costume + skin)
        self.create_basic_info_tab()
        
        # Tab skill
        self.create_skill_tab()
        
        # Tab thông số
        self.create_stats_tab()
        
    def create_basic_info_tab(self):
        """Tạo tab thông tin cơ bản (nhân vật, costume, skin)"""
        basic_frame = ttk.Frame(self.details_notebook)
        self.details_notebook.add(basic_frame, text="Thông tin cơ bản")
        
        # Tạo layout với 3 cột
        # Cột 1: Thông tin nhân vật
        char_frame = ttk.LabelFrame(basic_frame, text="Thông tin nhân vật", padding=10)
        char_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Form thông tin nhân vật
        self.create_character_form(char_frame)
        
        # Cột 2: Thông tin costume
        costume_frame = ttk.LabelFrame(basic_frame, text="Thông tin costume", padding=10)
        costume_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Form thông tin costume
        self.create_costume_form(costume_frame)
        
        # Cột 3: Thông tin skin
        skin_frame = ttk.LabelFrame(basic_frame, text="Thông tin skin", padding=10)
        skin_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Form thông tin skin
        self.create_skin_form(skin_frame)
        
    def create_skill_tab(self):
        """Tạo tab quản lý skill"""
        skill_frame = ttk.Frame(self.details_notebook)
        self.details_notebook.add(skill_frame, text="Skill")
        
        # Tạo layout với 2 cột
        # Cột trái: Thông tin skill cơ bản
        left_frame = ttk.LabelFrame(skill_frame, text="Thông tin skill", padding=10)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Form thông tin skill cơ bản
        self.create_skill_form(left_frame)
        
        # Cột phải: Skill levels và potential
        right_frame = ttk.LabelFrame(skill_frame, text="Skill levels & Potential", padding=10)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Form skill levels và potential
        self.create_skill_levels_form(right_frame)
        
    def create_skill_form(self, parent):
        """Tạo form thông tin skill cơ bản"""
        form_frame = ttk.Frame(parent)
        form_frame.pack(fill=tk.BOTH, expand=True)
        
        # Tạo các trường thông tin skill
        fields = [
            ("Tên skill:", "skill_name"),
            ("Chain:", "skill_chain"),
            ("Preview:", "skill_preview")
        ]
        
        self.skill_fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(form_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            if field == "skill_preview":
                entry = scrolledtext.ScrolledText(form_frame, height=3, width=40)
            else:
                entry = ttk.Entry(form_frame, width=40)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.skill_fields[field] = entry
            
        # Base skill description
        ttk.Label(form_frame, text="Mô tả skill:").grid(row=3, column=0, sticky=tk.NW, padx=5, pady=2)
        self.skill_fields["skill_base_skill"] = scrolledtext.ScrolledText(form_frame, height=4, width=40)
        self.skill_fields["skill_base_skill"].grid(row=3, column=1, sticky=tk.W, padx=5, pady=2)
        
    def create_skill_levels_form(self, parent):
        """Tạo form skill levels và potential"""
        # Skill levels
        levels_frame = ttk.LabelFrame(parent, text="Skill Levels", padding=5)
        levels_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
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
        potential_frame = ttk.LabelFrame(parent, text="Potential", padding=5)
        potential_frame.pack(fill=tk.BOTH, expand=True)
        
        self.potential_listbox = tk.Listbox(potential_frame, height=3)
        self.potential_listbox.pack(fill=tk.X, pady=(0, 5))
        
        potential_btn_frame = ttk.Frame(potential_frame)
        potential_btn_frame.pack(fill=tk.X)
        ttk.Button(potential_btn_frame, text="Thêm potential", command=self.add_potential).pack(side=tk.LEFT, padx=2)
        ttk.Button(potential_btn_frame, text="Sửa potential", command=self.edit_potential).pack(side=tk.LEFT, padx=2)
        ttk.Button(potential_btn_frame, text="Xóa potential", command=self.delete_potential).pack(side=tk.LEFT, padx=2)
        
    def create_character_form(self, parent):
        """Tạo form thông tin nhân vật"""
        form_frame = ttk.Frame(parent)
        form_frame.pack(fill=tk.BOTH, expand=True)
        
        # Tạo các trường thông tin
        fields = [
            ("ID:", "char_id"),
            ("Tên:", "char_name"),
            ("Thuộc tính:", "char_attribute"),
            ("Loại tấn công:", "char_atk_type"),
            ("Giới tính:", "char_gender"),
            ("Sao:", "char_star")
        ]
        
        self.char_fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(form_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            entry = ttk.Entry(form_frame, width=30)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.char_fields[field] = entry
            
        # ComboBox cho các trường có giá trị cố định
        self.char_fields["char_attribute"].destroy()
        self.char_fields["char_attribute"] = ttk.Combobox(form_frame, values=["Fire", "Water", "Earth", "Light", "Dark"], width=27)
        self.char_fields["char_attribute"].grid(row=1, column=1, sticky=tk.W, padx=5, pady=2)
        
        self.char_fields["char_atk_type"].destroy()
        self.char_fields["char_atk_type"] = ttk.Combobox(form_frame, values=["Physical", "Magic"], width=27)
        self.char_fields["char_atk_type"].grid(row=2, column=1, sticky=tk.W, padx=5, pady=2)
        
        self.char_fields["char_gender"].destroy()
        self.char_fields["char_gender"] = ttk.Combobox(form_frame, values=["Male", "Female"], width=27)
        self.char_fields["char_gender"].grid(row=3, column=1, sticky=tk.W, padx=5, pady=2)
        
        self.char_fields["char_star"].destroy()
        self.char_fields["char_star"] = ttk.Combobox(form_frame, values=[3, 4, 5], width=27)
        self.char_fields["char_star"].grid(row=4, column=1, sticky=tk.W, padx=5, pady=2)
        
        
    def create_costume_form(self, parent):
        """Tạo form thông tin costume"""
        form_frame = ttk.Frame(parent)
        form_frame.pack(fill=tk.BOTH, expand=True)
        
        # Tạo các trường thông tin
        fields = [
            ("ID:", "costume_id"),
            ("Path:", "costume_path"),
            ("Tên:", "costume_name"),
            ("Image URL:", "costume_image_url")
        ]
        
        self.costume_fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(form_frame, text=label).grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            entry = ttk.Entry(form_frame, width=40)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.costume_fields[field] = entry
            
        
    def create_skin_form(self, parent):
        """Tạo form thông tin skin"""
        form_frame = ttk.Frame(parent)
        form_frame.pack(fill=tk.BOTH, expand=True)
        
        # Danh sách skin
        ttk.Label(form_frame, text="Danh sách skin:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=2)
        self.skin_listbox = tk.Listbox(form_frame, height=4)
        self.skin_listbox.grid(row=1, column=0, columnspan=2, sticky=tk.W+tk.E, padx=5, pady=2)
        self.skin_listbox.bind('<<ListboxSelect>>', self.on_skin_select)
        
        # Buttons cho skin
        skin_btn_frame = ttk.Frame(form_frame)
        skin_btn_frame.grid(row=2, column=0, columnspan=2, sticky=tk.W+tk.E, padx=5, pady=2)
        ttk.Button(skin_btn_frame, text="Thêm skin", command=self.add_skin).pack(side=tk.LEFT, padx=2)
        ttk.Button(skin_btn_frame, text="Sửa skin", command=self.edit_skin).pack(side=tk.LEFT, padx=2)
        ttk.Button(skin_btn_frame, text="Xóa skin", command=self.delete_skin).pack(side=tk.LEFT, padx=2)
        
        # Tạo các trường thông tin
        fields = [
            ("Tên:", "skin_name"),
            ("Image URL:", "skin_image_url")
        ]
        
        self.skin_fields = {}
        for i, (label, field) in enumerate(fields):
            ttk.Label(form_frame, text=label).grid(row=i+3, column=0, sticky=tk.W, padx=5, pady=2)
            entry = ttk.Entry(form_frame, width=40)
            entry.grid(row=i+3, column=1, sticky=tk.W, padx=5, pady=2)
            self.skin_fields[field] = entry
            
    def create_stats_tab(self):
        """Tạo tab chỉnh sửa thông số"""
        stats_frame = ttk.Frame(self.details_notebook)
        self.details_notebook.add(stats_frame, text="Thông số")
        
        # Tạo form thông số trực tiếp
        self.create_stats_form(stats_frame)
        
    def create_stats_form(self, parent):
        """Tạo form chỉnh sửa thông số"""
        # Tạo layout với 3 cột
        main_frame = ttk.Frame(parent)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Cột 1: Max level stats
        max_frame = ttk.LabelFrame(main_frame, text="Thông số cấp tối đa", padding=10)
        max_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        max_stats_fields = ["ATK", "CR", "CRDM", "HP", "DEF", "MRES"]
        self.max_stats_fields = {}
        
        for i, field in enumerate(max_stats_fields):
            ttk.Label(max_frame, text=f"{field}:").grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            entry = ttk.Entry(max_frame, width=15)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.max_stats_fields[field] = entry
            
        # Cột 2: Engraving stats
        engraving_frame = ttk.LabelFrame(main_frame, text="Thông số khắc", padding=10)
        engraving_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        engraving_fields = ["HP", "ATK", "DEF"]
        self.engraving_fields = {}
        
        for i, field in enumerate(engraving_fields):
            ttk.Label(engraving_frame, text=f"{field}:").grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            entry = ttk.Entry(engraving_frame, width=15)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.engraving_fields[field] = entry
            
        # Cột 3: Awakening stats
        awakening_frame = ttk.LabelFrame(main_frame, text="Thông số thức tỉnh", padding=10)
        awakening_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        awakening_fields = ["ATK", "FIRE_DAMAGE", "WATER_DAMAGE", "EARTH_DAMAGE", "LIGHT_DAMAGE", "DARK_DAMAGE"]
        self.awakening_fields = {}
        
        for i, field in enumerate(awakening_fields):
            ttk.Label(awakening_frame, text=f"{field}:").grid(row=i, column=0, sticky=tk.W, padx=5, pady=2)
            entry = ttk.Entry(awakening_frame, width=15)
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=2)
            self.awakening_fields[field] = entry
            
        # Button lưu thông số
        ttk.Button(parent, text="💾 Lưu thông số", command=self.save_stats).pack(pady=20)
        
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
            
        
    def on_character_select(self, event):
        """Xử lý khi chọn nhân vật"""
        selection = self.char_listbox.curselection()
        if selection:
            index = selection[0]
            self.current_character = self.data["characters"][index]
            self.load_character_data()
            self.refresh_costume_list()
            
    def load_character_data(self):
        """Tải dữ liệu nhân vật vào form"""
        if not self.current_character:
            return
            
        char = self.current_character
        self.char_fields["char_id"].delete(0, tk.END)
        self.char_fields["char_id"].insert(0, char.get("id", ""))
        
        self.char_fields["char_name"].delete(0, tk.END)
        self.char_fields["char_name"].insert(0, char.get("name", ""))
        
        self.char_fields["char_attribute"].set(char.get("attribute", ""))
        self.char_fields["char_atk_type"].set(char.get("atkType", ""))
        self.char_fields["char_gender"].set(char.get("gender", ""))
        self.char_fields["char_star"].set(char.get("star", ""))
        
        # Tải dữ liệu thông số
        self.load_stats_data(char)
        
        # Tải dữ liệu skill nếu có costume được chọn
        if self.current_costume and "skill" in self.current_costume:
            self.load_skill_data()
        
    def refresh_costume_list(self):
        """Làm mới danh sách costume"""
        self.costume_listbox.delete(0, tk.END)
        if self.current_character and "costumes" in self.current_character:
            for costume in self.current_character["costumes"]:
                self.costume_listbox.insert(tk.END, f"{costume.get('name', 'Unknown')} ({costume.get('id', 'No ID')})")
                
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
            
    def load_costume_data(self):
        """Tải dữ liệu costume vào form"""
        if not self.current_costume:
            return
            
        costume = self.current_costume
        self.costume_fields["costume_id"].delete(0, tk.END)
        self.costume_fields["costume_id"].insert(0, costume.get("id", ""))
        
        self.costume_fields["costume_path"].delete(0, tk.END)
        self.costume_fields["costume_path"].insert(0, costume.get("path", ""))
        
        self.costume_fields["costume_name"].delete(0, tk.END)
        self.costume_fields["costume_name"].insert(0, costume.get("name", ""))
        
        self.costume_fields["costume_image_url"].delete(0, tk.END)
        self.costume_fields["costume_image_url"].insert(0, costume.get("image_url", ""))
        
    def refresh_skin_list(self):
        """Làm mới danh sách skin"""
        self.skin_listbox.delete(0, tk.END)
        if self.current_costume and "skin" in self.current_costume:
            for skin in self.current_costume["skin"]:
                self.skin_listbox.insert(tk.END, skin.get("name", "Unknown"))
        elif self.current_costume and "spine_data" in self.current_costume:
            # Fallback cho dữ liệu cũ
            for i, spine in enumerate(self.current_costume["spine_data"]):
                self.skin_listbox.insert(tk.END, f"Skin {i+1}")
                
    def on_skin_select(self, event):
        """Xử lý khi chọn skin"""
        if not self.current_costume:
            return
            
        selection = self.skin_listbox.curselection()
        if selection:
            index = selection[0]
            if "skin" in self.current_costume and index < len(self.current_costume["skin"]):
                current_skin = self.current_costume["skin"][index]
                self.load_skin_data(current_skin)
            elif "spine_data" in self.current_costume and index < len(self.current_costume["spine_data"]):
                # Fallback cho dữ liệu cũ
                spine_data = self.current_costume["spine_data"][index]
                self.load_skin_data({"name": f"Skin {index+1}", "image_url": ""})
            
    def load_skin_data(self, skin):
        """Tải dữ liệu skin vào form"""
        self.skin_fields["skin_name"].delete(0, tk.END)
        self.skin_fields["skin_name"].insert(0, skin.get("name", ""))
        
        self.skin_fields["skin_image_url"].delete(0, tk.END)
        self.skin_fields["skin_image_url"].insert(0, skin.get("image_url", ""))
        
    def load_skill_data(self):
        """Tải dữ liệu skill vào form"""
        if not self.current_costume or "skill" not in self.current_costume:
            return
            
        skill = self.current_costume["skill"]
        
        # Thông tin skill cơ bản
        self.skill_fields["skill_name"].delete(0, tk.END)
        self.skill_fields["skill_name"].insert(0, skill.get("name", ""))
        
        self.skill_fields["skill_chain"].delete(0, tk.END)
        self.skill_fields["skill_chain"].insert(0, str(skill.get("chain", "")))
        
        self.skill_fields["skill_preview"].delete(1.0, tk.END)
        self.skill_fields["skill_preview"].insert(1.0, skill.get("preview", ""))
        
        self.skill_fields["skill_base_skill"].delete(1.0, tk.END)
        self.skill_fields["skill_base_skill"].insert(1.0, skill.get("base_skill", ""))
        
        # Bind events để tự động lưu khi thay đổi
        self.skill_fields["skill_name"].bind('<KeyRelease>', self.save_skill_data)
        self.skill_fields["skill_chain"].bind('<KeyRelease>', self.save_skill_data)
        self.skill_fields["skill_preview"].bind('<KeyRelease>', self.save_skill_data)
        self.skill_fields["skill_base_skill"].bind('<KeyRelease>', self.save_skill_data)
        
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
                    
    def load_stats_data(self, char):
        """Tải dữ liệu thông số vào form"""
        # Max level stats
        max_stats = char.get("maxlevel", {})
        for field, entry in self.max_stats_fields.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(max_stats.get(field, "")))
            
        # Engraving stats
        engraving = char.get("engraving", {})
        for field, entry in self.engraving_fields.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(engraving.get(field, "")))
            
        # Awakening stats
        awakening = char.get("awakening", {})
        for field, entry in self.awakening_fields.items():
            entry.delete(0, tk.END)
            entry.insert(0, str(awakening.get(field, "")))
            
    def add_character(self):
        """Thêm nhân vật mới"""
        dialog = CharacterDialog(self.root, "Thêm nhân vật mới")
        if dialog.result:
            self.data["characters"].append(dialog.result)
            self.refresh_character_list()
            self.refresh_stats_char_list()
            
    def edit_character(self):
        """Sửa nhân vật"""
        if not self.current_character:
            messagebox.showwarning("Cảnh báo", "Vui lòng chọn nhân vật cần sửa!")
            return
            
        dialog = CharacterDialog(self.root, "Sửa nhân vật", self.current_character)
        if dialog.result:
            # Cập nhật dữ liệu
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
            self.refresh_character_list()
            self.clear_character_form()
            
    def clear_character_form(self):
        """Xóa form nhân vật"""
        for field in self.char_fields.values():
            if isinstance(field, ttk.Entry):
                field.delete(0, tk.END)
            elif isinstance(field, ttk.Combobox):
                field.set("")
                
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
            self.clear_costume_form()
            
    def clear_costume_form(self):
        """Xóa form costume"""
        for field in self.costume_fields.values():
            field.delete(0, tk.END)
            
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
        for field, entry in self.max_stats_fields.items():
            value = entry.get()
            if value:
                try:
                    char["maxlevel"][field] = int(value)
                except ValueError:
                    char["maxlevel"][field] = float(value)
                    
        # Cập nhật engraving stats
        if "engraving" not in char:
            char["engraving"] = {}
        for field, entry in self.engraving_fields.items():
            value = entry.get()
            if value:
                try:
                    char["engraving"][field] = int(value)
                except ValueError:
                    char["engraving"][field] = float(value)
                    
        # Cập nhật awakening stats
        if "awakening" not in char:
            char["awakening"] = {}
        for field, entry in self.awakening_fields.items():
            value = entry.get()
            if value:
                try:
                    char["awakening"][field] = int(value)
                except ValueError:
                    char["awakening"][field] = float(value)
                    
        messagebox.showinfo("Thành công", "Đã lưu thông số thành công!")


class CharacterDialog:
    def __init__(self, parent, title, character=None):
        self.result = None
        
        # Tạo dialog
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x300")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Tạo form
        self.create_form(character)
        
        # Center dialog
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        # Chờ dialog đóng
        self.dialog.wait_window()
        
    def create_form(self, character):
        """Tạo form trong dialog"""
        main_frame = ttk.Frame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Tạo các trường
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
                    values = ["Physical", "Magic"]
                elif field == "gender":
                    values = ["Male", "Female"]
                    
                entry = ttk.Combobox(main_frame, values=values, width=30)
            elif field == "star":
                entry = ttk.Combobox(main_frame, values=[3, 4, 5], width=30)
            else:
                entry = ttk.Entry(main_frame, width=30)
                
            entry.grid(row=i, column=1, sticky=tk.W, padx=5, pady=5)
            self.fields[field] = entry
            
        # Điền dữ liệu nếu có
        if character:
            for field, entry in self.fields.items():
                if isinstance(entry, ttk.Entry):
                    entry.insert(0, str(character.get(field, "")))
                else:
                    entry.set(str(character.get(field, "")))
                    
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=len(fields), column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="OK", command=self.ok_clicked).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel_clicked).pack(side=tk.LEFT, padx=5)
        
    def ok_clicked(self):
        """Xử lý khi nhấn OK"""
        # Tạo dữ liệu nhân vật
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
        char_data["maxlevel"] = {
            "ATK": 0, "CR": 0, "CRDM": 0, "HP": 0, "DEF": 0, "MRES": 0
        }
        char_data["engraving"] = {"HP": 0, "ATK": 0, "DEF": 0}
        char_data["awakening"] = {"ATK": 0}
        
        self.result = char_data
        self.dialog.destroy()
        
    def cancel_clicked(self):
        """Xử lý khi nhấn Cancel"""
        self.dialog.destroy()


class CostumeDialog:
    def __init__(self, parent, title, costume=None):
        self.result = None
        
        # Tạo dialog
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x200")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Tạo form
        self.create_form(costume)
        
        # Center dialog
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        # Chờ dialog đóng
        self.dialog.wait_window()
        
    def create_form(self, costume):
        """Tạo form trong dialog"""
        main_frame = ttk.Frame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Tạo các trường
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
            
        # Điền dữ liệu nếu có
        if costume:
            for field, entry in self.fields.items():
                entry.insert(0, str(costume.get(field, "")))
                
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=len(fields), column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="OK", command=self.ok_clicked).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel_clicked).pack(side=tk.LEFT, padx=5)
        
    def ok_clicked(self):
        """Xử lý khi nhấn OK"""
        costume_data = {
            "id": self.fields["id"].get(),
            "path": self.fields["path"].get(),
            "name": self.fields["name"].get(),
            "image_url": self.fields["image_url"].get(),
            "skin": []
        }
        
        self.result = costume_data
        self.dialog.destroy()
        
    def cancel_clicked(self):
        """Xử lý khi nhấn Cancel"""
        self.dialog.destroy()


class SkinDialog:
    def __init__(self, parent, title, skin=None):
        self.result = None
        
        # Tạo dialog
        self.dialog = tk.Toplevel(parent)
        self.dialog.title(title)
        self.dialog.geometry("400x150")
        self.dialog.transient(parent)
        self.dialog.grab_set()
        
        # Tạo form
        self.create_form(skin)
        
        # Center dialog
        self.dialog.geometry("+%d+%d" % (parent.winfo_rootx() + 50, parent.winfo_rooty() + 50))
        
        # Chờ dialog đóng
        self.dialog.wait_window()
        
    def create_form(self, skin):
        """Tạo form trong dialog"""
        main_frame = ttk.Frame(self.dialog)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Tạo các trường
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
            
        # Điền dữ liệu nếu có
        if skin:
            for field, entry in self.fields.items():
                entry.insert(0, str(skin.get(field, "")))
                
        # Buttons
        btn_frame = ttk.Frame(main_frame)
        btn_frame.grid(row=len(fields), column=0, columnspan=2, pady=20)
        
        ttk.Button(btn_frame, text="OK", command=self.ok_clicked).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=self.cancel_clicked).pack(side=tk.LEFT, padx=5)
        
    def ok_clicked(self):
        """Xử lý khi nhấn OK"""
        skin_data = {
            "name": self.fields["name"].get(),
            "image_url": self.fields["image_url"].get(),
            "spine_data": []
        }
        
        self.result = skin_data
        self.dialog.destroy()
        
    def cancel_clicked(self):
        """Xử lý khi nhấn Cancel"""
        self.dialog.destroy()


def main():
    """Hàm main"""
    root = tk.Tk()
    app = CharacterManager(root)
    root.mainloop()


if __name__ == "__main__":
    main()
