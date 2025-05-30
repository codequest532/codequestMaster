-- Categories data
INSERT INTO categories (id, name, description, icon, color, "order") VALUES 
(32, 'Logic Puzzles', 'Challenge your logical thinking with brain teasers', '🧩', '#8B5CF6', 1),
(33, 'Algorithms', 'Master fundamental algorithms and problem-solving techniques', '🧮', '#3B82F6', 2),
(34, 'Data Structures', 'Learn arrays, trees, graphs, and advanced data structures', '🏗️', '#10B981', 3);

-- Reset sequence for categories
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));