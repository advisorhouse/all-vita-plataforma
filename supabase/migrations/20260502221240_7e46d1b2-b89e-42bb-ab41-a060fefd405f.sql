UPDATE tenant_protocol_landing 
SET quiz_header_title = REPLACE(quiz_header_title, 'Dr. {doctor}', '{doctor}')
WHERE quiz_header_title LIKE 'Dr. {doctor}%';