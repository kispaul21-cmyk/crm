-- Добавление новых полей в таблицу deals
-- Поля для контактной информации и суммы сделки

-- Сумма сделки
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS value NUMERIC(15, 2);

-- Контактная информация
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS contact_name TEXT;

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS contact_email TEXT;

ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS contact_phone TEXT;

-- Комментарий сотрудника
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Добавляем индексы для улучшения производительности поиска
CREATE INDEX IF NOT EXISTS idx_deals_contact_name ON deals(contact_name);
CREATE INDEX IF NOT EXISTS idx_deals_contact_email ON deals(contact_email);
CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value);

COMMENT ON COLUMN deals.value IS 'Сумма сделки в рублях';
COMMENT ON COLUMN deals.contact_name IS 'Имя контактного лица';
COMMENT ON COLUMN deals.contact_email IS 'Email контактного лица';
COMMENT ON COLUMN deals.contact_phone IS 'Телефон контактного лица';
COMMENT ON COLUMN deals.comment IS 'Комментарий сотрудника по сделке';
