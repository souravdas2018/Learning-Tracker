-- Learning Tracker Database Schema
-- Author: Sourav Kumar Das
-- PostgreSQL Database Schema for Supabase

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  access BOOLEAN,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  login_at TIMESTAMP NULL,
  duration TEXT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  fees TEXT,
  created_by UUID REFERENCES admin(id),
  created_at TIMESTAMP DEFAULT now()
);

-- Modules Table
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_by UUID REFERENCES admin(id),
  created_at TIMESTAMP DEFAULT now()
);

-- User Courses Table (Enrollment)
CREATE TABLE IF NOT EXISTS user_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT now(),
  status TEXT DEFAULT 'active',
  UNIQUE (user_id, course_id)
);

-- User Module Progress Table
CREATE TABLE IF NOT EXISTS user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  progress INT DEFAULT 0,         -- %
  time_spent INT DEFAULT 0,       -- minutes (dummy/manual)
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE (user_id, module_id)
);
