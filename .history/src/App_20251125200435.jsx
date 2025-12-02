import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 
import Sidebar from './components/Sidebar';
import CrmView from './components/CrmView';
import { TasksView, CompaniesView } from './components/OtherViews'; // SettingsView убрали отсюда
import SettingsView from './components/SettingsView'; // И добавили сюда отдельно
import { DealModal, CompanyModal } from './components/Modals';