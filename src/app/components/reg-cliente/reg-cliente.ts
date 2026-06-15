import {Component, inject} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ClienteService} from '../../services/cliente-service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-reg-cliente',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './reg-cliente.html',
  styleUrl: './reg-cliente.css',
})
export class RegCliente {
  private fb = inject(
    NonNullableFormBuilder
  );

  private clienteService =
    inject(ClienteService);

  private snackBar =
    inject(MatSnackBar);

  readonly clienteForm =
    this.fb.group({

      nombres: [
        '',
        Validators.required
      ],

      apellidos: [
        '',
        Validators.required
      ],

      tipoDocumento: [
        'DNI',
        Validators.required
      ],

      numeroDocumento: [
        '',
        Validators.required
      ],

      correo: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      telefono: [
        '',
        Validators.required
      ],

      direccion: [
        '',
        Validators.required
      ]
    });

  guardarCliente(): void {

    if (this.clienteForm.invalid) {

      this.clienteForm.markAllAsTouched();

      this.snackBar.open(
        'Complete todos los campos',
        'Cerrar',
        { duration: 3000 }
      );

      return;
    }

    this.clienteService
      .crearCliente(
        this.clienteForm.getRawValue()
      )
      .subscribe({

        next: () => {

          this.snackBar.open(
            'Cliente registrado correctamente',
            'Cerrar',
            {
              duration: 3000
            }
          );

          this.clienteForm.reset({
            tipoDocumento: 'DNI'
          });
        },

        error: (error) => {
          if (error.status !== 400) {
            this.snackBar.open(
              'Error al registrar cliente',
              'Cerrar',
              { duration: 3000 }
            );
          }
        }
      });
  }
}
