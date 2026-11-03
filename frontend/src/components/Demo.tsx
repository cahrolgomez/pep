import { Children, isValidElement, useState } from 'react';
import type { ReactNode, FormHTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';
type Props = FormHTMLAttributes<HTMLFormElement> & { demo?: boolean; filter?: boolean };
export function DemoForm({ children, demo, filter, ...props }: Props) {
 const [feedback, setFeedback] = useState('');
 const navigate = useNavigate();
 return <form {...props} onSubmit={event => {
  event.preventDefault();
  if (props.id === 'login-form') {
   const profile = new FormData(event.currentTarget).get('perfil');
   navigate(profile === 'painel-medico' ? '/painel-medico' : '/painel');
   return;
  }
  setFeedback(filter ? 'Dados ilustrativos exibidos. A consulta por filtros depende da integração com a API.' : 'Simulação concluída. Nenhum dado foi salvo ou enviado à API.');
 }}>{children}<p className="feedback" role="status">{feedback}</p></form>;
}
function textOf(node: ReactNode): string {
 return Children.toArray(node).map(child => isValidElement<{children?: ReactNode}>(child) ? textOf(child.props.children) : String(child)).join(' ');
}
export function SearchBody({ children, search }: {children: ReactNode; search: string}) {
 const rows = Children.toArray(children).filter(child => textOf(child).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
 return <tbody>{rows.length ? rows : <tr><td colSpan={10}>Nenhum paciente encontrado.</td></tr>}</tbody>;
}
