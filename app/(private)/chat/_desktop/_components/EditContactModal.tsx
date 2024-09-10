import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { editContactFormSchema, EditContactFormSchema } from "@/zodSchemas/editContactForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { create, InstanceProps } from "react-modal-promise";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/form/InputFormField";
import { ComboboxFormField } from "@/components/form/ComboboxField";
import { Contact } from "@/types/Chat";

export interface Props extends InstanceProps<any, any> {
  contact: Contact;
}

const EditContact = (props: Props) => {
  const { isOpen, onResolve } = props;

  const form = useForm<EditContactFormSchema>({
    resolver: zodResolver(editContactFormSchema),
    defaultValues: {
      fullName: props.contact.fullName,
      address: props.contact.address,
      type: props.contact.type,
      phone_id: props.contact.phone_id,
    }
  })
  
  const handleCloseClick = () => {
    onResolve(undefined);
  }

  const onSubmit = form.handleSubmit(async (values: EditContactFormSchema) => {
    onResolve(values);
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {'Editar contacto'}
          <Separator className='my-3' />
        </AlertDialogTitle>
          <Form {...form}>
            <form className="space-y-4">
              <InputFormField
                controllerProps={{
                  control: form.control,
                  name: 'fullName'
                }}
                label='Nombre'
              />
              <InputFormField
                controllerProps={{
                  control: form.control,
                  name: 'address'
                }}
                label='Direccion'
              />
              <ComboboxFormField
                items={[
                  { label: 'Mayoreo', value: 'wholesale' },
                  { label: 'Menudeo', value: 'retail' },
                ]}
                controllerProps={{
                  control: form.control,
                  name: 'type'
                }}
                label='Tipo'
                placeholder='Selecciona un tipo...'
                searchLabel='Buscar un tipo...'
                emptyLabel="No hay tipos"
              />
              <InputFormField
                controllerProps={{
                  control: form.control,
                  name: 'phone_id'
                }}
                label='Numero de telefono'
                disabled
              />
            </form>
          </Form>
          <AlertDialogFooter className="gap-2">
            <AlertDialogAction asChild>
              <Button onClick={handleCloseClick}>Cerrar</Button>
            </AlertDialogAction>
            <AlertDialogAction asChild>
              <Button
                onClick={onSubmit}
              >
                Editar
              </Button>
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog >
  );
}

export const EditContactModal = create(EditContact);