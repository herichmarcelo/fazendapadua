-- Tabela de Empresas/Responsáveis
create table empresas (
  id uuid default gen_random_uuid() primary key,
  razao_social varchar(255) not null,
  nome varchar(255) not null,
  cnpj varchar(20),
  contato varchar(20),
  nome_proprietario varchar(255),
  ativo boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Tipos de Serviço
create table tipos_servico (
  id uuid default gen_random_uuid() primary key,
  nome varchar(100) not null,
  preco_padrao_metro numeric(10,2) not null,
  unidade varchar(20) default 'metro',
  descricao text,
  ativo boolean default true
);

-- Tabela de Serviços
create table servicos (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade,
  tipo_servico_id uuid references tipos_servico(id),
  data date not null,
  metragem numeric(10,2) not null,
  preco_unitario numeric(10,2) not null,
  valor_total numeric(10,2) not null,
  observacoes text,
  local_servico text,
  status varchar(50) default 'pendente',
  fotos text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabela de Pagamentos
create table pagamentos (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id),
  valor numeric(10,2) not null,
  data_pagamento date not null,
  forma_pagamento varchar(50),
  comprovante_url text,
  observacoes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Dados iniciais
insert into empresas (razao_social, nome, cnpj, contato, nome_proprietario) values 
('AGRICOLA JUNIOR CABRINE LTDA', 'JUNIOR CABRINE', '12.345.678/0001-90', '(11) 99999-9999', 'João da Silva'),
('AGRICOLA EDENILSON LTDA', 'EDENILSON', '12.345.678/0002-91', '(11) 98888-8888', 'Maria Santos'),
('AGRICOLA DEVILSON LTDA', 'DEVILSON', '12.345.678/0003-92', '(11) 97777-7777', 'Pedro Oliveira'),
('AGRICOLA EDERILSON LTDA', 'EDERILSON', '12.345.678/0004-93', '(11) 96666-6666', 'Ana Costa'),
('AGRICOLA DENILSON LTDA', 'DENILSON', '12.345.678/0005-94', '(11) 95555-5555', 'Carlos Lima');

insert into tipos_servico (nome, preco_padrao_metro, unidade, descricao) values
('DESMANCHE', 2.15, 'metro', 'Desmanche de cerca'),
('CERCA FEITA', 4.80, 'metro', 'Cerca convencional'),
('BALANCINHO', 1.00, 'metro', 'Arame balancinho'),
('CHOQUE', 2.00, 'metro', 'Cerca elétrica'),
('COLCHETE', 50.00, 'unidade', 'Colchete'),
('PORTEIRA FERRO', 100.00, 'unidade', 'Porteira de ferro'),
('TABUADO PORTEIRA', 50.00, 'unidade', 'Tabuado de porteira');

-- Row Level Security
alter table empresas enable row level security;
alter table tipos_servico enable row level security;
alter table servicos enable row level security;
alter table pagamentos enable row level security;

create policy "Empresas públicas" on empresas for select using (true);
create policy "Empresas insert" on empresas for insert with check (true);
create policy "Empresas update" on empresas for update using (true);
create policy "Empresas delete" on empresas for delete using (true);

create policy "Tipos serviço públicos" on tipos_servico for select using (true);
create policy "Tipos serviço insert" on tipos_servico for insert with check (true);
create policy "Tipos serviço update" on tipos_servico for update using (true);
create policy "Tipos serviço delete" on tipos_servico for delete using (true);

create policy "Servicos acesso total" on servicos for all using (true);
create policy "Pagamentos acesso total" on pagamentos for all using (true);